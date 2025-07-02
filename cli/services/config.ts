import { readFile, access } from 'fs/promises';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import chalk from 'chalk';
import type { AutoDocsConfig } from '../types/index.js';

const defaultConfig: AutoDocsConfig = {
  ai: 'openai',
  ignore: [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'build/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/test/**',
    '**/tests/**'
  ],
  style: 'detailed',
  output: './docs',
  format: 'markdown'
};

export async function loadConfig(configPath: string): Promise<AutoDocsConfig> {
  try {
    const fullPath = resolve(configPath);
    
    // Check if config file exists
    try {
      await access(fullPath);
    } catch {
      console.log(chalk.gray(`📋 Config file not found: ${configPath}, using defaults`));
      return defaultConfig;
    }

    // Try to load the config file
    let config: Partial<AutoDocsConfig> = {};

    if (configPath.endsWith('.json')) {
      const content = await readFile(fullPath, 'utf-8');
      config = JSON.parse(content);
    } else {
      // Dynamic import for JS config files
      const configUrl = pathToFileURL(fullPath).href;
      const configModule = await import(configUrl);
      config = configModule.default || configModule;
    }

    // Merge with defaults
    const mergedConfig = {
      ...defaultConfig,
      ...config,
      ignore: [
        ...defaultConfig.ignore,
        ...(config.ignore || [])
      ]
    };

    console.log(chalk.green(`📋 Loaded configuration from: ${configPath}`));
    return mergedConfig;

  } catch (error) {
    console.log(chalk.yellow(`⚠️  Failed to load config from ${configPath}: ${error.message}`));
    console.log(chalk.gray('📋 Using default configuration'));
    return defaultConfig;
  }
}

export function validateConfig(config: AutoDocsConfig): string[] {
  const errors: string[] = [];

  if (!['openai', 'ollama'].includes(config.ai)) {
    errors.push(`Invalid AI provider: ${config.ai}. Must be 'openai' or 'ollama'`);
  }

  if (!['concise', 'detailed'].includes(config.style)) {
    errors.push(`Invalid style: ${config.style}. Must be 'concise' or 'detailed'`);
  }

  if (!['markdown', 'html', 'json'].includes(config.format)) {
    errors.push(`Invalid format: ${config.format}. Must be 'markdown', 'html', or 'json'`);
  }

  if (!Array.isArray(config.ignore)) {
    errors.push('ignore must be an array of glob patterns');
  }

  return errors;
}
