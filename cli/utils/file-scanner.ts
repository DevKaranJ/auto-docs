import { glob } from 'glob';
import { resolve } from 'path';
import chalk from 'chalk';

const SUPPORTED_EXTENSIONS = ['js', 'jsx', 'ts', 'tsx', 'py', 'go'];

export async function scanFiles(sourcePath: string, ignorePatterns: string[] = []): Promise<string[]> {
  const patterns = SUPPORTED_EXTENSIONS.map(ext => `**/*.${ext}`);
  
  const defaultIgnores = [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'build/**',
    '**/*.min.js',
    '**/*.test.*',
    '**/*.spec.*'
  ];

  const allIgnores = [...defaultIgnores, ...ignorePatterns];

  try {
    const files = await glob(patterns, {
      cwd: sourcePath,
      absolute: true,
      ignore: allIgnores,
      nodir: true
    });

    return files.sort();
  } catch (error) {
    throw new Error(`Failed to scan files in ${sourcePath}: ${error.message}`);
  }
}

export function filterFilesByLanguage(files: string[], languages: string[]): string[] {
  const langExtensions = {
    javascript: ['.js', '.jsx'],
    typescript: ['.ts', '.tsx'],
    python: ['.py'],
    go: ['.go']
  };

  const allowedExtensions = languages.flatMap(lang => langExtensions[lang] || []);
  
  return files.filter(file => {
    const ext = file.substring(file.lastIndexOf('.')).toLowerCase();
    return allowedExtensions.includes(ext);
  });
}

export function groupFilesByLanguage(files: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {
    javascript: [],
    typescript: [],
    python: [],
    go: []
  };

  files.forEach(file => {
    const ext = file.substring(file.lastIndexOf('.')).toLowerCase();
    
    switch (ext) {
      case '.js':
      case '.jsx':
        groups.javascript.push(file);
        break;
      case '.ts':
      case '.tsx':
        groups.typescript.push(file);
        break;
      case '.py':
        groups.python.push(file);
        break;
      case '.go':
        groups.go.push(file);
        break;
    }
  });

  // Remove empty groups
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
}
