import path from 'path';
import fs from 'fs/promises';
import { parseJavaScript } from './javascript.js';
import { parseTypeScript } from './typescript.js';
import { parsePython } from './python.js';
import { parseGo } from './go.js';
import { logger } from '../../utils/logger.js';
import type { ParsedCodeFile, SupportedLanguage } from '../../types/index.js';

export async function parseCode(filePath: string): Promise<ParsedCodeFile> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase();
    const language = getLanguageFromExtension(ext);

    if (!language) {
      throw new Error(`Unsupported file extension: ${ext}`);
    }

    const baseResult: ParsedCodeFile = {
      filePath,
      language,
      content,
      functions: [],
      classes: [],
      imports: [],
      exports: []
    };

    switch (language) {
      case 'javascript':
        return await parseJavaScript(content, baseResult);
      case 'typescript':
        return await parseTypeScript(content, baseResult);
      case 'python':
        return await parsePython(content, baseResult);
      case 'go':
        return await parseGo(content, baseResult);
      default:
        throw new Error(`Parser not implemented for language: ${language}`);
    }

  } catch (error) {
    logger.error(`Failed to parse ${filePath}:`, error);
    throw error;
  }
}

function getLanguageFromExtension(ext: string): SupportedLanguage | null {
  const extensionMap: Record<string, SupportedLanguage> = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.go': 'go'
  };

  return extensionMap[ext] || null;
}

export function getSupportedExtensions(): string[] {
  return ['.js', '.jsx', '.ts', '.tsx', '.py', '.go'];
}
