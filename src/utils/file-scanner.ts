import { glob } from 'glob';
import path from 'path';
import fs from 'fs/promises';
import { logger } from './logger.js';

export interface ScanOptions {
  ignore: string[];
  supportedExtensions: string[];
  maxFileSize?: number;
  followSymlinks?: boolean;
}

export async function scanFiles(sourcePath: string, options: ScanOptions): Promise<string[]> {
  try {
    const stats = await fs.stat(sourcePath);
    
    if (stats.isFile()) {
      // Single file
      return [path.resolve(sourcePath)];
    } else if (stats.isDirectory()) {
      // Directory - scan for files
      return await scanDirectory(sourcePath, options);
    } else {
      throw new Error(`Unsupported file type: ${sourcePath}`);
    }
  } catch (error) {
    logger.error(`Failed to scan ${sourcePath}:`, error);
    throw error;
  }
}

async function scanDirectory(dirPath: string, options: ScanOptions): Promise<string[]> {
  const maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB default
  
  // Build glob patterns for supported extensions
  const patterns = options.supportedExtensions.map(ext => 
    path.join(dirPath, `**/*${ext}`)
  );

  // Build ignore patterns
  const ignorePatterns = [
    ...options.ignore,
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/*.min.js',
    '**/*.d.ts', // TypeScript declaration files
    '**/*.test.*',
    '**/*.spec.*',
    '**/__tests__/**',
    '**/__mocks__/**'
  ];

  const files: string[] = [];

  for (const pattern of patterns) {
    try {
      const matches = await glob(pattern, {
        ignore: ignorePatterns,
        follow: options.followSymlinks || false,
        absolute: true,
        nodir: true
      });

      for (const file of matches) {
        try {
          // Check file size
          const stats = await fs.stat(file);
          if (stats.size > maxFileSize) {
            logger.warn(`Skipping large file (${formatFileSize(stats.size)}): ${file}`);
            continue;
          }

          // Check if file is readable
          await fs.access(file, fs.constants.R_OK);
          
          files.push(file);
        } catch (error) {
          logger.warn(`Skipping inaccessible file: ${file}`);
          continue;
        }
      }
    } catch (error) {
      logger.error(`Failed to process pattern ${pattern}:`, error);
      continue;
    }
  }

  // Remove duplicates and sort
  const uniqueFiles = [...new Set(files)].sort();
  
  logger.debug(`Found ${uniqueFiles.length} files to process`);
  return uniqueFiles;
}

export async function isValidSourceFile(filePath: string, supportedExtensions: string[]): Promise<boolean> {
  try {
    const ext = path.extname(filePath).toLowerCase();
    if (!supportedExtensions.includes(ext)) {
      return false;
    }

    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      return false;
    }

    // Check if file is readable
    await fs.access(filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export function getFileLanguage(filePath: string): string | null {
  const ext = path.extname(filePath).toLowerCase();
  const languageMap: Record<string, string> = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.go': 'go'
  };

  return languageMap[ext] || null;
}

export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export function isIgnored(filePath: string, ignorePatterns: string[]): boolean {
  const relativePath = path.relative(process.cwd(), filePath);
  
  return ignorePatterns.some(pattern => {
    // Convert glob pattern to regex for simple matching
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(relativePath);
  });
}

export async function createGitignorePatterns(projectRoot: string): Promise<string[]> {
  try {
    const gitignorePath = path.join(projectRoot, '.gitignore');
    const content = await fs.readFile(gitignorePath, 'utf-8');
    
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => line.startsWith('/') ? line.substring(1) : line);
  } catch {
    return []; // .gitignore doesn't exist or is not readable
  }
}
