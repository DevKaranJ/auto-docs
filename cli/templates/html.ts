import { basename } from 'path';
import type { ParsedFile } from '../types/index.js';

interface DocumentedFile extends ParsedFile {
  documentation: string;
}

export function generateHTML(documentedFiles: DocumentedFile[], title: string = 'Auto-Generated Documentation'): string {
  const date = new Date().toLocaleDateString();
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        .language-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            margin-right: 8px;
        }
        .javascript { background: #f7df1e; color: #000; }
        .typescript { background: #3178c6; color: #fff; }
        .python { background: #3776ab; color: #fff; }
        .go { background: #00add8; color: #fff; }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin: 20px 0;
        }
        .stat-card {
            padding: 16px;
            border: 1px solid #e1e1e1;
            border-radius: 8px;
            text-align: center;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #007acc;
        }
        .toc {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .toc ul {
            list-style-type: none;
            padding-left: 20px;
        }
        .toc > ul {
            padding-left: 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📚 ${title}</h1>
        <p>Generated on ${date} by <a href="https://github.com/your-username/auto-docs" target="_blank">Auto-Docs</a> 🤖</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${documentedFiles.length}</div>
            <div>Files Analyzed</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${getUniqueLanguages(documentedFiles).length}</div>
            <div>Languages</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${getTotalFunctions(documentedFiles)}</div>
            <div>Functions</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${getTotalClasses(documentedFiles)}</div>
            <div>Classes</div>
        </div>
    </div>

    <div class="toc">
        <h2>📑 Table of Contents</h2>
        ${generateHTMLTableOfContents(documentedFiles)}
    </div>

    <div class="content">
        <h2>📁 File Documentation</h2>
        ${generateFileDocumentation(documentedFiles)}
    </div>

    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e1e1e1; text-align: center; color: #666;">
        <p>Documentation generated with ❤️ by <a href="https://github.com/your-username/auto-docs" target="_blank">Auto-Docs</a></p>
    </footer>
</body>
</html>`;
}

function generateHTMLTableOfContents(files: DocumentedFile[]): string {
  const filesByLanguage = groupFilesByLanguage(files);
  let toc = '<ul>';
  
  Object.entries(filesByLanguage).forEach(([language, languageFiles]) => {
    toc += `<li><strong>${getLanguageIcon(language)} ${capitalizeFirst(language)}</strong><ul>`;
    languageFiles.forEach(file => {
      const anchor = generateAnchor(file.path);
      toc += `<li><a href="#${anchor}">${basename(file.path)}</a></li>`;
    });
    toc += '</ul></li>';
  });
  
  toc += '</ul>';
  return toc;
}

function generateFileDocumentation(files: DocumentedFile[]): string {
  const filesByLanguage = groupFilesByLanguage(files);
  let html = '';
  
  Object.entries(filesByLanguage).forEach(([language, languageFiles]) => {
    html += `<h3>${getLanguageIcon(language)} ${capitalizeFirst(language)} Files</h3>`;
    
    languageFiles.forEach(file => {
      const anchor = generateAnchor(file.path);
      
      html += `<div class="file-section" id="${anchor}">`;
      html += `<h4 class="file-title">📄 ${basename(file.path)}</h4>`;
      html += `<p><strong>Path:</strong> <code>${file.path}</code></p>`;
      html += `<span class="language-badge ${language}">${language.toUpperCase()}</span>`;
      
      if (file.functions.length > 0) {
        html += `<p><strong>Functions:</strong> ${file.functions.map(f => `<code>${f.name}()</code>`).join(', ')}</p>`;
      }
      
      if (file.classes.length > 0) {
        html += `<p><strong>Classes:</strong> ${file.classes.map(c => `<code>${c.name}</code>`).join(', ')}</p>`;
      }
      
      if (file.exports.length > 0) {
        html += `<p><strong>Exports:</strong> ${file.exports.map(e => `<code>${e}</code>`).join(', ')}</p>`;
      }
      
      // Convert markdown to HTML (basic conversion)
      html += `<div class="documentation">${markdownToHTML(file.documentation)}</div>`;
      html += '</div>';
    });
  });
  
  return html;
}

function markdownToHTML(markdown: string): string {
  return markdown
    .replace(/### (.*)/g, '<h3>$1</h3>')
    .replace(/## (.*)/g, '<h2>$1</h2>')
    .replace(/# (.*)/g, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.)/gm, '<p>$1')
    .replace(/(.*)$/gm, '$1</p>')
    .replace(/<p><\/p>/g, '');
}

function generateAnchor(path: string): string {
  return basename(path).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
}

function getUniqueLanguages(files: DocumentedFile[]): string[] {
  return [...new Set(files.map(f => f.language))];
}

function getTotalFunctions(files: DocumentedFile[]): number {
  return files.reduce((total, file) => total + file.functions.length, 0);
}

function getTotalClasses(files: DocumentedFile[]): number {
  return files.reduce((total, file) => total + file.classes.length, 0);
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
