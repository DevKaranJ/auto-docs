import path from 'path';
import fs from 'fs/promises';
import { getOutputFileName, createIndexFile } from './index.js';
import type { DocumentationResult, GenerationOptions } from '../../types/index.js';

export async function generateHTML(
  results: DocumentationResult[],
  options: GenerationOptions
): Promise<void> {
  // Generate individual HTML files for each source file
  for (const result of results) {
    const outputFile = getOutputFileName(result.file, 'html', options.outputPath);
    const htmlContent = await generateHTMLForFile(result);
    
    await fs.writeFile(outputFile, htmlContent, 'utf-8');
  }

  // Create an index file
  await createIndexFile(results, options);
}

async function generateHTMLForFile(result: DocumentationResult): Promise<string> {
  const { file, parsedCode, documentation } = result;
  const fileName = path.basename(file);
  const relativePath = path.relative(process.cwd(), file);

  // Load HTML template
  const template = await loadHTMLTemplate();
  
  // Generate content sections
  const functionsHTML = documentation.functions?.map(func => generateFunctionHTML(func)).join('') || '';
  const classesHTML = documentation.classes?.map(cls => generateClassHTML(cls)).join('') || '';
  const exportsHTML = documentation.exports?.map(exp => generateExportHTML(exp)).join('') || '';

  // Generate table of contents
  const tocHTML = generateTableOfContents(documentation);

  // Replace template placeholders
  return template
    .replace('{{TITLE}}', documentation.title || fileName)
    .replace('{{FILE_PATH}}', relativePath)
    .replace('{{LANGUAGE}}', parsedCode.language)
    .replace('{{DESCRIPTION}}', documentation.description || 'No description available')
    .replace('{{TABLE_OF_CONTENTS}}', tocHTML)
    .replace('{{FUNCTIONS}}', functionsHTML)
    .replace('{{CLASSES}}', classesHTML)
    .replace('{{EXPORTS}}', exportsHTML)
    .replace('{{USAGE}}', documentation.usage || '')
    .replace('{{NOTES}}', documentation.notes || '')
    .replace('{{GENERATED_DATE}}', new Date().toLocaleDateString());
}

async function loadHTMLTemplate(): Promise<string> {
  try {
    const templatePath = path.resolve(process.cwd(), 'templates', 'html-template.html');
    return await fs.readFile(templatePath, 'utf-8');
  } catch (error) {
    // Fallback to inline template if file doesn't exist
    return getDefaultHTMLTemplate();
  }
}

function getDefaultHTMLTemplate(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}} - Documentation</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            min-height: 100vh;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        
        .header .meta {
            color: #6c757d;
            font-size: 0.9em;
        }
        
        .description {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #007bff;
        }
        
        .toc {
            background: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .toc h2 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 1.4em;
        }
        
        .toc ul {
            list-style: none;
            padding-left: 0;
        }
        
        .toc li {
            margin-bottom: 8px;
        }
        
        .toc a {
            color: #007bff;
            text-decoration: none;
            padding: 5px 10px;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        
        .toc a:hover {
            background-color: #f8f9fa;
            text-decoration: underline;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section h2 {
            color: #2c3e50;
            font-size: 1.8em;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .function, .class, .export {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .function h3, .class h3, .export h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 1.4em;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        
        .signature {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9em;
            overflow-x: auto;
        }
        
        .parameters, .returns {
            margin: 15px 0;
        }
        
        .parameters h4, .returns h4 {
            color: #495057;
            margin-bottom: 10px;
            font-size: 1.1em;
        }
        
        .param {
            background: #f8f9fa;
            border-left: 3px solid #28a745;
            padding: 10px 15px;
            margin-bottom: 8px;
            border-radius: 0 4px 4px 0;
        }
        
        .param-name {
            font-weight: bold;
            color: #2c3e50;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        
        .param-type {
            color: #6f42c1;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9em;
        }
        
        .example {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
            overflow-x: auto;
        }
        
        .example pre {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9em;
            white-space: pre-wrap;
        }
        
        .methods {
            margin-top: 20px;
        }
        
        .method {
            border-left: 3px solid #17a2b8;
            padding-left: 20px;
            margin-bottom: 20px;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            text-align: center;
            color: #6c757d;
            font-size: 0.9em;
        }
        
        code {
            background: #f8f9fa;
            color: #e83e8c;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9em;
        }
        
        .badge {
            display: inline-block;
            padding: 3px 8px;
            font-size: 0.75em;
            font-weight: bold;
            border-radius: 12px;
            text-transform: uppercase;
            margin-right: 8px;
        }
        
        .badge-async { background: #28a745; color: white; }
        .badge-static { background: #17a2b8; color: white; }
        .badge-private { background: #dc3545; color: white; }
        .badge-protected { background: #ffc107; color: #212529; }
        
        @media (max-width: 768px) {
            .container { padding: 10px; }
            .header h1 { font-size: 2em; }
            .function, .class, .export { padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{TITLE}}</h1>
            <div class="meta">
                <strong>File:</strong> <code>{{FILE_PATH}}</code><br>
                <strong>Language:</strong> {{LANGUAGE}}
            </div>
        </div>
        
        <div class="description">
            {{DESCRIPTION}}
        </div>
        
        {{TABLE_OF_CONTENTS}}
        
        {{FUNCTIONS}}
        
        {{CLASSES}}
        
        {{EXPORTS}}
        
        <div class="section">
            {{USAGE}}
        </div>
        
        <div class="section">
            {{NOTES}}
        </div>
        
        <div class="footer">
            Generated by Auto-Docs on {{GENERATED_DATE}}
        </div>
    </div>
</body>
</html>
  `.trim();
}

function generateTableOfContents(documentation: any): string {
  const sections = [];
  
  if (documentation.functions?.length) {
    const functionLinks = documentation.functions.map((func: any) => 
      `<li><a href="#func-${func.name}">${func.name}()</a></li>`
    ).join('');
    sections.push(`
      <h3>Functions</h3>
      <ul>${functionLinks}</ul>
    `);
  }
  
  if (documentation.classes?.length) {
    const classLinks = documentation.classes.map((cls: any) => 
      `<li><a href="#class-${cls.name}">${cls.name}</a></li>`
    ).join('');
    sections.push(`
      <h3>Classes</h3>
      <ul>${classLinks}</ul>
    `);
  }
  
  if (documentation.exports?.length) {
    const exportLinks = documentation.exports.map((exp: any) => 
      `<li><a href="#export-${exp.name}">${exp.name}</a></li>`
    ).join('');
    sections.push(`
      <h3>Exports</h3>
      <ul>${exportLinks}</ul>
    `);
  }
  
  if (sections.length === 0) return '';
  
  return `
    <div class="toc">
      <h2>Table of Contents</h2>
      ${sections.join('')}
    </div>
  `;
}

function generateFunctionHTML(func: any): string {
  const badges = [];
  if (func.isAsync) badges.push('<span class="badge badge-async">async</span>');
  if (func.isStatic) badges.push('<span class="badge badge-static">static</span>');
  if (func.visibility === 'private') badges.push('<span class="badge badge-private">private</span>');
  if (func.visibility === 'protected') badges.push('<span class="badge badge-protected">protected</span>');

  const params = func.parameters?.map((p: any) => 
    `${p.name}${p.type !== 'any' ? `: ${p.type}` : ''}${p.defaultValue ? ` = ${p.defaultValue}` : ''}`
  ).join(', ') || '';
  
  const returnType = func.returns?.type !== 'any' ? ` → ${func.returns.type}` : '';

  const parametersHTML = func.parameters?.length ? `
    <div class="parameters">
      <h4>Parameters:</h4>
      ${func.parameters.map((param: any) => `
        <div class="param">
          <span class="param-name">${param.name}</span>
          <span class="param-type">${param.type}</span>
          ${param.defaultValue ? `<em>(default: ${param.defaultValue})</em>` : ''}
          <div>${param.description || 'No description'}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const returnsHTML = func.returns && func.returns.type !== 'void' ? `
    <div class="returns">
      <h4>Returns:</h4>
      <div class="param">
        <span class="param-type">${func.returns.type}</span>
        <div>${func.returns.description || 'No description'}</div>
      </div>
    </div>
  ` : '';

  const exampleHTML = func.example ? `
    <div class="example">
      <h4>Example:</h4>
      <pre><code>${func.example}</code></pre>
    </div>
  ` : '';

  return `
    <div class="section">
      <h2>Functions</h2>
      <div class="function" id="func-${func.name}">
        <h3>${badges.join('')}${func.name}</h3>
        ${func.description ? `<p>${func.description}</p>` : ''}
        
        <div class="signature">
          <strong>Signature:</strong> ${func.name}(${params})${returnType}
        </div>
        
        ${parametersHTML}
        ${returnsHTML}
        ${exampleHTML}
      </div>
    </div>
  `;
}

function generateClassHTML(cls: any): string {
  const propertiesHTML = cls.properties?.length ? `
    <div class="properties">
      <h4>Properties:</h4>
      ${cls.properties.map((prop: any) => {
        const badges = [];
        if (prop.isStatic) badges.push('<span class="badge badge-static">static</span>');
        if (prop.visibility === 'private') badges.push('<span class="badge badge-private">private</span>');
        if (prop.visibility === 'protected') badges.push('<span class="badge badge-protected">protected</span>');
        
        return `
          <div class="param">
            ${badges.join('')}
            <span class="param-name">${prop.name}</span>
            <span class="param-type">${prop.type}</span>
            ${prop.optional ? '<em>(optional)</em>' : ''}
            <div>${prop.description || 'No description'}</div>
          </div>
        `;
      }).join('')}
    </div>
  ` : '';

  const methodsHTML = cls.methods?.length ? `
    <div class="methods">
      <h4>Methods:</h4>
      ${cls.methods.map((method: any) => `
        <div class="method">
          ${generateFunctionHTML(method)}
        </div>
      `).join('')}
    </div>
  ` : '';

  return `
    <div class="section">
      <h2>Classes</h2>
      <div class="class" id="class-${cls.name}">
        <h3>${cls.name}</h3>
        ${cls.description ? `<p>${cls.description}</p>` : ''}
        ${cls.superClass ? `<p><strong>Extends:</strong> <code>${cls.superClass}</code></p>` : ''}
        
        ${propertiesHTML}
        ${methodsHTML}
      </div>
    </div>
  `;
}

function generateExportHTML(exp: any): string {
  return `
    <div class="export" id="export-${exp.name}">
      <h3>${exp.name}</h3>
      <p><strong>Type:</strong> <code>${exp.type}</code></p>
      ${exp.description ? `<p>${exp.description}</p>` : ''}
      ${exp.typeDefinition ? `<div class="signature"><strong>Type Definition:</strong> ${exp.typeDefinition}</div>` : ''}
    </div>
  `;
}
