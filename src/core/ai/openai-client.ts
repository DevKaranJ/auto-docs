import OpenAI from 'openai';
import { logger } from '../../utils/logger.js';
import type { ParsedCodeFile, DocumentationStyle } from '../../types/index.js';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const DEFAULT_MODEL = 'gpt-4o';

export class OpenAIClient {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.client = new OpenAI({ apiKey });
  }

  async generateDocumentation(
    parsedCode: ParsedCodeFile,
    options: {
      style: DocumentationStyle;
      includeExamples: boolean;
      format: 'structured' | 'markdown';
    }
  ): Promise<any> {
    try {
      const prompt = this.buildDocumentationPrompt(parsedCode, options);
      
      const response = await this.client.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert technical documentation writer. Your task is to generate comprehensive, clear, and useful documentation for code files. Always respond with valid JSON in the requested format.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3, // Lower temperature for more consistent documentation
        max_tokens: 4000
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      return JSON.parse(content);

    } catch (error) {
      if (error instanceof Error) {
        logger.error(`OpenAI API error: ${error.message}`);
        throw new Error(`Failed to generate documentation: ${error.message}`);
      }
      throw error;
    }
  }

  private buildDocumentationPrompt(
    parsedCode: ParsedCodeFile,
    options: {
      style: DocumentationStyle;
      includeExamples: boolean;
      format: 'structured' | 'markdown';
    }
  ): string {
    const styleDescription = options.style === 'concise' 
      ? 'Write concise, to-the-point documentation focusing on essential information only.'
      : 'Write detailed, comprehensive documentation with thorough explanations and context.';

    const exampleInstruction = options.includeExamples 
      ? 'Include practical usage examples for functions and classes where appropriate.'
      : 'Focus on descriptions without usage examples.';

    return `
Please generate ${options.style} documentation for the following code file.

File: ${parsedCode.filePath}
Language: ${parsedCode.language}

${styleDescription}
${exampleInstruction}

Code Structure:
${JSON.stringify({
  functions: parsedCode.functions,
  classes: parsedCode.classes,
  exports: parsedCode.exports,
  imports: parsedCode.imports
}, null, 2)}

Raw Code:
\`\`\`${parsedCode.language}
${parsedCode.content}
\`\`\`

Respond with a JSON object in this exact structure:
{
  "title": "Clear, descriptive title for this file",
  "description": "Brief overview of what this file does",
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
      "example": "Optional usage example (if requested)"
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
          "example": "Optional usage example"
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
  "usage": "Overall usage instructions for this module",
  "notes": "Any additional important notes or considerations"
}

Ensure all descriptions are clear, professional, and helpful for developers who will use this code.
    `.trim();
  }

  async improveExistingDocumentation(
    existingDocs: string,
    codeContext: ParsedCodeFile
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a documentation improvement expert. Enhance existing documentation to make it more clear, comprehensive, and useful.'
          },
          {
            role: 'user',
            content: `
Please improve the following documentation for better clarity and completeness:

Existing Documentation:
${existingDocs}

Code Context:
File: ${codeContext.filePath}
Language: ${codeContext.language}

Functions: ${codeContext.functions.map(f => f.name).join(', ')}
Classes: ${codeContext.classes.map(c => c.name).join(', ')}

Please provide the improved documentation in markdown format.
            `.trim()
          }
        ],
        temperature: 0.4,
        max_tokens: 3000
      });

      return response.choices[0].message.content || existingDocs;

    } catch (error) {
      logger.error('Failed to improve documentation:', error);
      return existingDocs; // Return original if improvement fails
    }
  }
}
