import path from 'path';
import fs from 'fs/promises';
import { generateMarkdown } from './markdown.js';
import { generateHTML } from './html.js';
import { generateJSON } from './json.js';
import { logger } from '../../utils/logger.js';
import type { DocumentationFormat, DocumentationResult, GenerationOptions } from '../../types/index.js';

export async function generateDocumentation(
  results: DocumentationResult[],
  options: GenerationOptions
): Promise<void> {
  try {
    // Ensure output directory exists
    await fs.mkdir(options.outputPath, { recursive: true });

    switch (options.format) {
      case 'markdown':
        await generateMarkdown(results, options);
        break;
      case 'html':
        await generateHTML(results, options);
        break;
      case 'json':
        await generateJSON(results, options);
        break;
      default:
        throw new Error(`Unsupported output format: ${options.format}`);
    }

    logger.info(`Generated ${options.format} documentation in ${options.outputPath}/`);

  } catch (error) {
    logger.error('Failed to generate documentation:', error);
    throw error;
  }
}

export async function ensureOutputDirectory(outputPath: string): Promise<void> {
  try {
    await fs.access(outputPath);
  } catch {
    await fs.mkdir(outputPath, { recursive: true });
    logger.debug(`Created output directory: ${outputPath}`);
  }
}

export function getOutputFileName(
  originalFile: string,
  format: DocumentationFormat,
  outputPath: string
): string {
  const baseName = path.basename(originalFile, path.extname(originalFile));
  const extension = format === 'json' ? 'json' : format === 'html' ? 'html' : 'md';
  
  return path.join(outputPath, `${baseName}.${extension}`);
}

export async function createIndexFile(
  results: DocumentationResult[],
  options: GenerationOptions
): Promise<void> {
  const indexPath = path.join(options.outputPath, `index.${getExtensionForFormat(options.format)}`);
  
  let indexContent = '';

  if (options.format === 'markdown') {
    indexContent = generateMarkdownIndex(results);
  } else if (options.format === 'html') {
    indexContent = generateHTMLIndex(results);
  } else if (options.format === 'json') {
    indexContent = JSON.stringify({
      title: 'Documentation Index',
      generated: new Date().toISOString(),
      files: results.map(result => ({
        file: result.file,
        title: result.documentation.title || path.basename(result.file),
        description: result.documentation.description,
        functions: result.documentation.functions?.length || 0,
        classes: result.documentation.classes?.length || 0
      }))
    }, null, 2);
  }

  await fs.writeFile(indexPath, indexContent, 'utf-8');
  logger.info(`Created index file: ${indexPath}`);
}

function getExtensionForFormat(format: DocumentationFormat): string {
  switch (format) {
    case 'markdown': return 'md';
    case 'html': return 'html';
    case 'json': return 'json';
    default: return 'txt';
  }
}

function generateMarkdownIndex(results: DocumentationResult[]): string {
  const lines = [
    '# Documentation Index',
    '',
    `Generated on ${new Date().toLocaleDateString()}`,
    '',
    '## Files',
    ''
  ];

  results.forEach(result => {
    const fileName = path.basename(result.file);
    const docFileName = getOutputFileName(result.file, 'markdown', '.');
    const title = result.documentation.title || fileName;
    const description = result.documentation.description || 'No description available';
    
    lines.push(`### [${title}](${path.basename(docFileName)})`);
    lines.push(`**File:** \`${fileName}\``);
    lines.push(`**Description:** ${description}`);
    
    if (result.documentation.functions?.length) {
      lines.push(`**Functions:** ${result.documentation.functions.length}`);
    }
    
    if (result.documentation.classes?.length) {
      lines.push(`**Classes:** ${result.documentation.classes.length}`);
    }
    
    lines.push('');
  });

  return lines.join('\n');
}

function generateHTMLIndex(results: DocumentationResult[]): string {
  const fileList = results.map(result => {
    const fileName = path.basename(result.file);
    const docFileName = getOutputFileName(result.file, 'html', '.');
    const title = result.documentation.title || fileName;
    const description = result.documentation.description || 'No description available';
    
    return `
      <div class="file-item">
        <h3><a href="${path.basename(docFileName)}">${title}</a></h3>
        <p><strong>File:</strong> <code>${fileName}</code></p>
        <p><strong>Description:</strong> ${description}</p>
        ${result.documentation.functions?.length ? `<p><strong>Functions:</strong> ${result.documentation.functions.length}</p>` : ''}
        ${result.documentation.classes?.length ? `<p><strong>Classes:</strong> ${result.documentation.classes.length}</p>` : ''}
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentation Index</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; line-height: 1.6; }
        .file-item { margin-bottom: 30px; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px; }
        .file-item h3 { margin-top: 0; }
        .file-item a { text-decoration: none; color: #0066cc; }
        .file-item a:hover { text-decoration: underline; }
        code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>Documentation Index</h1>
    <p>Generated on ${new Date().toLocaleDateString()}</p>
    ${fileList}
</body>
</html>
  `.trim();
}
