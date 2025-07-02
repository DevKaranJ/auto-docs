import { writeFile, mkdir } from 'fs/promises';
import { dirname, join, extname, basename } from 'path';
import chalk from 'chalk';
import { generateMarkdown } from '../templates/markdown.js';
import { generateHTML } from '../templates/html.js';
import type { ParsedFile, OutputFormat } from '../types/index.js';

interface DocumentedFile extends ParsedFile {
  documentation: string;
}

export async function writeOutput(
  documentedFiles: DocumentedFile[],
  outputPath: string,
  format: OutputFormat
): Promise<void> {
  // Ensure output directory exists
  await mkdir(outputPath, { recursive: true });

  switch (format) {
    case 'markdown':
      await writeMarkdownOutput(documentedFiles, outputPath);
      break;
    case 'html':
      await writeHTMLOutput(documentedFiles, outputPath);
      break;
    case 'json':
      await writeJSONOutput(documentedFiles, outputPath);
      break;
    default:
      throw new Error(`Unsupported output format: ${format}`);
  }
}

async function writeMarkdownOutput(documentedFiles: DocumentedFile[], outputPath: string): Promise<void> {
  // Generate main README.md
  const mainReadme = generateMarkdown(documentedFiles);
  await writeFile(join(outputPath, 'README.md'), mainReadme);

  // Generate individual file documentation
  for (const file of documentedFiles) {
    const fileName = basename(file.path, extname(file.path));
    const docFileName = `${fileName}.md`;
    const docPath = join(outputPath, docFileName);
    
    const individualDoc = `# ${basename(file.path)}\n\n${file.documentation}`;
    await writeFile(docPath, individualDoc);
  }

  console.log(chalk.green(`📄 Generated ${documentedFiles.length + 1} Markdown files`));
}

async function writeHTMLOutput(documentedFiles: DocumentedFile[], outputPath: string): Promise<void> {
  // Generate main index.html
  const mainHTML = generateHTML(documentedFiles);
  await writeFile(join(outputPath, 'index.html'), mainHTML);

  // Generate individual file documentation
  for (const file of documentedFiles) {
    const fileName = basename(file.path, extname(file.path));
    const docFileName = `${fileName}.html`;
    const docPath = join(outputPath, docFileName);
    
    const individualHTML = generateHTML([file], `Documentation for ${basename(file.path)}`);
    await writeFile(docPath, individualHTML);
  }

  // Copy CSS file
  const cssContent = `
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      line-height: 1.6; 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 20px; 
      color: #333; 
    }
    .header { 
      border-bottom: 2px solid #007acc; 
      padding-bottom: 20px; 
      margin-bottom: 30px; 
    }
    .file-section { 
      margin-bottom: 40px; 
      padding: 20px; 
      border: 1px solid #e1e1e1; 
      border-radius: 8px; 
    }
    .file-title { 
      color: #007acc; 
      border-bottom: 1px solid #e1e1e1; 
      padding-bottom: 10px; 
    }
    code { 
      background: #f4f4f4; 
      padding: 2px 4px; 
      border-radius: 3px; 
    }
    pre { 
      background: #f4f4f4; 
      padding: 15px; 
      border-radius: 5px; 
      overflow-x: auto; 
    }
  `;
  await writeFile(join(outputPath, 'styles.css'), cssContent);

  console.log(chalk.green(`🌐 Generated ${documentedFiles.length + 1} HTML files`));
}

async function writeJSONOutput(documentedFiles: DocumentedFile[], outputPath: string): Promise<void> {
  const jsonOutput = {
    generatedAt: new Date().toISOString(),
    totalFiles: documentedFiles.length,
    files: documentedFiles.map(file => ({
      path: file.path,
      language: file.language,
      functions: file.functions,
      classes: file.classes,
      exports: file.exports,
      imports: file.imports,
      documentation: file.documentation
    }))
  };

  await writeFile(
    join(outputPath, 'documentation.json'),
    JSON.stringify(jsonOutput, null, 2)
  );

  console.log(chalk.green('📋 Generated documentation.json'));
}

export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}
