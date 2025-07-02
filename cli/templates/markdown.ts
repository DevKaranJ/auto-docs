import { basename } from 'path';
import type { ParsedFile } from '../types/index.js';

interface DocumentedFile extends ParsedFile {
  documentation: string;
}

export function generateMarkdown(documentedFiles: DocumentedFile[]): string {
  const date = new Date().toLocaleDateString();
  
  let markdown = `# 📚 Auto-Generated Documentation

> Generated on ${date} by [Auto-Docs](https://github.com/your-username/auto-docs) 🤖

## 📋 Overview

This documentation was automatically generated using AI to analyze your codebase and create comprehensive explanations of your code's functionality.

### 📊 Summary
- **Total Files Analyzed**: ${documentedFiles.length}
- **Languages Detected**: ${getUniqueLanguages(documentedFiles).join(', ')}
- **Generated Sections**: ${getTotalSections(documentedFiles)}

---

## 📁 File Documentation

`;

  // Group files by language
  const filesByLanguage = groupFilesByLanguage(documentedFiles);
  
  Object.entries(filesByLanguage).forEach(([language, files]) => {
    markdown += `### ${getLanguageIcon(language)} ${capitalizeFirst(language)} Files\n\n`;
    
    files.forEach(file => {
      markdown += `#### 📄 \`${basename(file.path)}\`\n\n`;
      markdown += `**Path**: \`${file.path}\`\n\n`;
      
      if (file.functions.length > 0) {
        markdown += `**Functions**: ${file.functions.map(f => `\`${f.name}()\``).join(', ')}\n\n`;
      }
      
      if (file.classes.length > 0) {
        markdown += `**Classes**: ${file.classes.map(c => `\`${c.name}\``).join(', ')}\n\n`;
      }
      
      if (file.exports.length > 0) {
        markdown += `**Exports**: ${file.exports.map(e => `\`${e}\``).join(', ')}\n\n`;
      }
      
      markdown += file.documentation + '\n\n';
      markdown += '---\n\n';
    });
  });

  // Add table of contents
  const toc = generateTableOfContents(documentedFiles);
  markdown = markdown.replace('---\n\n## 📁 File Documentation', `${toc}\n\n---\n\n## 📁 File Documentation`);

  // Add footer
  markdown += `
## 🚀 Getting Started

To regenerate this documentation, run:
\`\`\`bash
npx auto-docs generate
\`\`\`

## 📖 Need Help?

- [Auto-Docs Documentation](https://github.com/your-username/auto-docs)
- [Report Issues](https://github.com/your-username/auto-docs/issues)
- [Contributing Guide](https://github.com/your-username/auto-docs/blob/main/CONTRIBUTING.md)

---

*Documentation generated with ❤️ by Auto-Docs*
`;

  return markdown;
}

function generateTableOfContents(documentedFiles: DocumentedFile[]): string {
  let toc = '## 📑 Table of Contents\n\n';
  
  const filesByLanguage = groupFilesByLanguage(documentedFiles);
  
  Object.entries(filesByLanguage).forEach(([language, files]) => {
    toc += `- ${getLanguageIcon(language)} **${capitalizeFirst(language)}**\n`;
    files.forEach(file => {
      const anchor = basename(file.path).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      toc += `  - [${basename(file.path)}](#📄-${anchor})\n`;
    });
    toc += '\n';
  });
  
  return toc;
}

function getUniqueLanguages(files: DocumentedFile[]): string[] {
  return [...new Set(files.map(f => f.language))];
}

function getTotalSections(files: DocumentedFile[]): number {
  return files.reduce((total, file) => {
    return total + file.functions.length + file.classes.length;
  }, 0);
}

function groupFilesByLanguage(files: DocumentedFile[]): Record<string, DocumentedFile[]> {
  const groups: Record<string, DocumentedFile[]> = {};
  
  files.forEach(file => {
    if (!groups[file.language]) {
      groups[file.language] = [];
    }
    groups[file.language].push(file);
  });
  
  return groups;
}

function getLanguageIcon(language: string): string {
  const icons = {
    javascript: '🟨',
    typescript: '🔷',
    python: '🐍',
    go: '🐹'
  };
  return icons[language] || '📄';
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
