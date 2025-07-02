import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import OpenAI from "openai";
import { storage } from "./storage";
import { setupAuth } from "./auth";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const DEFAULT_MODEL = 'gpt-4o';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'default_openai_key'
});

// Validation schemas
const generateDocsSchema = z.object({
  code: z.string().min(1, "Code is required"),
  language: z.enum(["javascript", "typescript", "python", "go"]),
  format: z.enum(["markdown", "html", "json"]),
  style: z.enum(["concise", "detailed"])
});

const demoRequestSchema = z.object({
  id: z.string(),
  code: z.string(),
  language: z.string(),
  format: z.string(),
  style: z.string(),
  timestamp: z.date().default(() => new Date())
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);
  
  // Generate documentation endpoint
  app.post("/api/generate-docs", async (req, res) => {
    try {
      const { code, language, format, style } = generateDocsSchema.parse(req.body);
      
      const startTime = Date.now();
      
      // Parse code structure (simplified for demo)
      const parsedCode = parseCodeStructure(code, language);
      
      // Generate AI documentation
      const documentation = await generateAIDocumentation(code, language, style, parsedCode);
      
      // Format output based on requested format
      const formattedOutput = formatDocumentation(documentation, format);
      
      const processingTime = Date.now() - startTime;
      
      // Store demo request
      const demoRequest = await storage.createDemoRequest({
        id: `demo_${Date.now()}`,
        code,
        language,
        format,
        style,
        timestamp: new Date()
      });
      
      res.json({
        markdown: format === 'markdown' ? formattedOutput : formatDocumentation(documentation, 'markdown'),
        html: format === 'html' ? formattedOutput : formatDocumentation(documentation, 'html'),
        json: format === 'json' ? formattedOutput : formatDocumentation(documentation, 'json'),
        processingTime,
        stats: {
          functionsCount: parsedCode.functions.length,
          classesCount: parsedCode.classes.length,
          exportsCount: parsedCode.exports.length
        }
      });
      
    } catch (error) {
      console.error("Documentation generation error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid request data",
          details: error.errors
        });
      }
      
      res.status(500).json({
        error: "Failed to generate documentation",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get demo statistics
  app.get("/api/demo-stats", async (req, res) => {
    try {
      const stats = await storage.getDemoStats();
      res.json(stats);
    } catch (error) {
      console.error("Failed to get demo stats:", error);
      res.status(500).json({ error: "Failed to get statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to parse code structure
function parseCodeStructure(code: string, language: string) {
  const functions: any[] = [];
  const classes: any[] = [];
  const exports: any[] = [];
  
  // Simple regex-based parsing for demo purposes
  // In production, you'd use proper AST parsers
  
  if (language === 'javascript' || language === 'typescript') {
    // Parse functions
    const functionRegex = /(?:function\s+|const\s+\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|\([^)]*\)\s*{)|class\s+\w+)/g;
    const functionMatches = code.match(functionRegex) || [];
    
    functionMatches.forEach((match, index) => {
      if (match.includes('function') || match.includes('=>')) {
        functions.push({
          name: `function_${index + 1}`,
          type: 'function',
          startLine: 1
        });
      } else if (match.includes('class')) {
        classes.push({
          name: `class_${index + 1}`,
          type: 'class',
          startLine: 1
        });
      }
    });
    
  } else if (language === 'python') {
    // Parse Python functions and classes
    const defRegex = /def\s+(\w+)/g;
    const classRegex = /class\s+(\w+)/g;
    
    let match;
    while ((match = defRegex.exec(code)) !== null) {
      functions.push({
        name: match[1],
        type: 'function',
        startLine: 1
      });
    }
    
    while ((match = classRegex.exec(code)) !== null) {
      classes.push({
        name: match[1],
        type: 'class',
        startLine: 1
      });
    }
    
  } else if (language === 'go') {
    // Parse Go functions and structs
    const funcRegex = /func\s+(?:\([^)]*\)\s+)?(\w+)/g;
    const structRegex = /type\s+(\w+)\s+struct/g;
    
    let match;
    while ((match = funcRegex.exec(code)) !== null) {
      functions.push({
        name: match[1],
        type: 'function',
        startLine: 1
      });
    }
    
    while ((match = structRegex.exec(code)) !== null) {
      classes.push({
        name: match[1],
        type: 'struct',
        startLine: 1
      });
    }
  }
  
  return { functions, classes, exports };
}

// Helper function to generate AI documentation
async function generateAIDocumentation(code: string, language: string, style: string, parsedCode: any) {
  const styleDescription = style === 'concise' 
    ? 'Write concise, to-the-point documentation focusing on essential information only.'
    : 'Write detailed, comprehensive documentation with thorough explanations and context.';

  const prompt = `
You are an expert technical documentation writer. Generate comprehensive documentation for the following ${language} code.

${styleDescription}

Include practical usage examples for functions and classes where appropriate.

Code to document:
\`\`\`${language}
${code}
\`\`\`

Respond with a JSON object in this exact structure:
{
  "title": "Clear, descriptive title for this code",
  "description": "Brief overview of what this code does",
  "functions": [
    {
      "name": "function_name",
      "description": "What this function does",
      "parameters": [
        {
          "name": "param_name",
          "type": "param_type",
          "description": "What this parameter is for"
        }
      ],
      "returns": {
        "type": "return_type",
        "description": "What this function returns"
      },
      "example": "Usage example"
    }
  ],
  "classes": [
    {
      "name": "class_name",
      "description": "What this class represents",
      "methods": [
        {
          "name": "method_name",
          "description": "What this method does",
          "parameters": [],
          "returns": {},
          "example": "Usage example"
        }
      ],
      "properties": [
        {
          "name": "property_name",
          "type": "property_type",
          "description": "What this property represents"
        }
      ]
    }
  ],
  "exports": [
    {
      "name": "export_name",
      "type": "export_type",
      "description": "What this export provides"
    }
  ],
  "usage": "Overall usage instructions for this code",
  "notes": "Any additional important notes or considerations"
}

Ensure all descriptions are clear, professional, and helpful for developers who will use this code.
  `.trim();

  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical documentation writer. Your task is to generate comprehensive, clear, and useful documentation for code. Always respond with valid JSON in the requested format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    return JSON.parse(content);

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback documentation for demo purposes
    return {
      title: `${language.charAt(0).toUpperCase() + language.slice(1)} Code Documentation`,
      description: "AI-generated documentation for the provided code.",
      functions: parsedCode.functions.map((fn: any) => ({
        name: fn.name,
        description: `Function that performs specific operations.`,
        parameters: [],
        returns: { type: "any", description: "Returns processed result" },
        example: `${fn.name}()`
      })),
      classes: parsedCode.classes.map((cls: any) => ({
        name: cls.name,
        description: `Class that encapsulates related functionality.`,
        methods: [],
        properties: []
      })),
      exports: [],
      usage: "Import and use the functions/classes as needed in your application.",
      notes: "This is a fallback documentation generated when AI service is unavailable."
    };
  }
}

// Helper function to format documentation
function formatDocumentation(documentation: any, format: string): string {
  switch (format) {
    case 'markdown':
      return generateMarkdownDoc(documentation);
    case 'html':
      return generateHTMLDoc(documentation);
    case 'json':
      return JSON.stringify(documentation, null, 2);
    default:
      return generateMarkdownDoc(documentation);
  }
}

function generateMarkdownDoc(doc: any): string {
  let markdown = `# ${doc.title}\n\n`;
  
  if (doc.description) {
    markdown += `${doc.description}\n\n`;
  }
  
  if (doc.functions && doc.functions.length > 0) {
    markdown += `## Functions\n\n`;
    doc.functions.forEach((func: any) => {
      markdown += `### ${func.name}\n\n`;
      markdown += `${func.description}\n\n`;
      
      if (func.parameters && func.parameters.length > 0) {
        markdown += `**Parameters:**\n`;
        func.parameters.forEach((param: any) => {
          markdown += `- **${param.name}** \`${param.type}\` - ${param.description}\n`;
        });
        markdown += `\n`;
      }
      
      if (func.returns && func.returns.type !== 'void') {
        markdown += `**Returns:**\n`;
        markdown += `- \`${func.returns.type}\` - ${func.returns.description}\n\n`;
      }
      
      if (func.example) {
        markdown += `**Example:**\n`;
        markdown += `\`\`\`javascript\n${func.example}\n\`\`\`\n\n`;
      }
    });
  }
  
  if (doc.classes && doc.classes.length > 0) {
    markdown += `## Classes\n\n`;
    doc.classes.forEach((cls: any) => {
      markdown += `### ${cls.name}\n\n`;
      markdown += `${cls.description}\n\n`;
      
      if (cls.properties && cls.properties.length > 0) {
        markdown += `**Properties:**\n`;
        cls.properties.forEach((prop: any) => {
          markdown += `- **${prop.name}** \`${prop.type}\` - ${prop.description}\n`;
        });
        markdown += `\n`;
      }
      
      if (cls.methods && cls.methods.length > 0) {
        markdown += `**Methods:**\n`;
        cls.methods.forEach((method: any) => {
          markdown += `- **${method.name}** - ${method.description}\n`;
        });
        markdown += `\n`;
      }
    });
  }
  
  if (doc.usage) {
    markdown += `## Usage\n\n${doc.usage}\n\n`;
  }
  
  if (doc.notes) {
    markdown += `## Notes\n\n${doc.notes}\n\n`;
  }
  
  markdown += `---\n\n*Generated by Auto-Docs*`;
  
  return markdown;
}

function generateHTMLDoc(doc: any): string {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${doc.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; line-height: 1.6; }
        h1, h2, h3 { color: #2c3e50; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f8f8f8; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .function, .class { margin-bottom: 30px; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>${doc.title}</h1>`;
  
  if (doc.description) {
    html += `<p>${doc.description}</p>`;
  }
  
  if (doc.functions && doc.functions.length > 0) {
    html += `<h2>Functions</h2>`;
    doc.functions.forEach((func: any) => {
      html += `<div class="function">
        <h3>${func.name}</h3>
        <p>${func.description}</p>`;
      
      if (func.parameters && func.parameters.length > 0) {
        html += `<h4>Parameters:</h4><ul>`;
        func.parameters.forEach((param: any) => {
          html += `<li><strong>${param.name}</strong> <code>${param.type}</code> - ${param.description}</li>`;
        });
        html += `</ul>`;
      }
      
      if (func.returns && func.returns.type !== 'void') {
        html += `<h4>Returns:</h4><p><code>${func.returns.type}</code> - ${func.returns.description}</p>`;
      }
      
      if (func.example) {
        html += `<h4>Example:</h4><pre><code>${func.example}</code></pre>`;
      }
      
      html += `</div>`;
    });
  }
  
  if (doc.classes && doc.classes.length > 0) {
    html += `<h2>Classes</h2>`;
    doc.classes.forEach((cls: any) => {
      html += `<div class="class">
        <h3>${cls.name}</h3>
        <p>${cls.description}</p>`;
      
      if (cls.properties && cls.properties.length > 0) {
        html += `<h4>Properties:</h4><ul>`;
        cls.properties.forEach((prop: any) => {
          html += `<li><strong>${prop.name}</strong> <code>${prop.type}</code> - ${prop.description}</li>`;
        });
        html += `</ul>`;
      }
      
      html += `</div>`;
    });
  }
  
  if (doc.usage) {
    html += `<h2>Usage</h2><p>${doc.usage}</p>`;
  }
  
  if (doc.notes) {
    html += `<h2>Notes</h2><p>${doc.notes}</p>`;
  }
  
  html += `<hr><p><em>Generated by Auto-Docs</em></p></body></html>`;
  
  return html;
}
