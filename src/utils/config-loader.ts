import path from 'path';
import fs from 'fs/promises';
import { logger } from './logger.js';
import type { ConfigOptions } from '../types/index.js';

const DEFAULT_CONFIG: ConfigOptions = {
  ai: 'openai',
  format: 'markdown',
  style: 'detailed',
  output: './docs',
  ignore: [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'build/**',
    '*.min.js',
    '*.test.*',
    '*.spec.*',
    '__tests__/**',
    '__mocks__/**'
  ]
};

export async function loadConfig(configPath?: string): Promise<ConfigOptions> {
  let config = { ...DEFAULT_CONFIG };

  // Try to find config file
  const configFilePath = await findConfigFile(configPath);
  
  if (configFilePath) {
    try {
      logger.debug(`Loading config from: ${configFilePath}`);
      const loadedConfig = await loadConfigFile(configFilePath);
      config = mergeConfigs(config, loadedConfig);
      logger.info(`Configuration loaded from ${configFilePath}`);
    } catch (error) {
      logger.error(`Failed to load config from ${configFilePath}:`, error);
      logger.info('Using default configuration');
    }
  } else {
    logger.debug('No configuration file found, using defaults');
  }

  // Validate configuration
  validateConfig(config);
  
  return config;
}

async function findConfigFile(providedPath?: string): Promise<string | null> {
  if (providedPath) {
    // Use provided path
    try {
      await fs.access(providedPath);
      return path.resolve(providedPath);
    } catch {
      throw new Error(`Config file not found: ${providedPath}`);
    }
  }

  // Search for config files in current directory
  const configFileNames = [
    'autodocs.config.js',
    'autodocs.config.mjs',
    'autodocs.config.cjs',
    'autodocs.config.json',
    '.autodocsrc.js',
    '.autodocsrc.json'
  ];

  for (const fileName of configFileNames) {
    const filePath = path.resolve(process.cwd(), fileName);
    try {
      await fs.access(filePath);
      return filePath;
    } catch {
      continue;
    }
  }

  return null;
}

async function loadConfigFile(configPath: string): Promise<Partial<ConfigOptions>> {
  const ext = path.extname(configPath).toLowerCase();
  
  if (ext === '.json') {
    return await loadJSONConfig(configPath);
  } else if (['.js', '.mjs', '.cjs'].includes(ext)) {
    return await loadJSConfig(configPath);
  } else {
    throw new Error(`Unsupported config file format: ${ext}`);
  }
}

async function loadJSONConfig(configPath: string): Promise<Partial<ConfigOptions>> {
  const content = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(content);
}

async function loadJSConfig(configPath: string): Promise<Partial<ConfigOptions>> {
  try {
    // Use dynamic import to load the config file
    const configModule = await import(`file://${path.resolve(configPath)}`);
    return configModule.default || configModule;
  } catch (error) {
    // Fallback for CommonJS modules
    try {
      delete require.cache[require.resolve(configPath)];
      return require(configPath);
    } catch (requireError) {
      throw new Error(`Failed to load config file: ${error.message}`);
    }
  }
}

function mergeConfigs(base: ConfigOptions, override: Partial<ConfigOptions>): ConfigOptions {
  return {
    ai: override.ai || base.ai,
    format: override.format || base.format,
    style: override.style || base.style,
    output: override.output || base.output,
    ignore: override.ignore ? [...base.ignore, ...override.ignore] : base.ignore,
    // Allow any additional properties from the override
    ...override
  };
}

function validateConfig(config: ConfigOptions): void {
  // Validate AI provider
  const validAIProviders = ['openai', 'ollama'];
  if (!validAIProviders.includes(config.ai)) {
    throw new Error(`Invalid AI provider: ${config.ai}. Must be one of: ${validAIProviders.join(', ')}`);
  }

  // Validate format
  const validFormats = ['markdown', 'html', 'json'];
  if (!validFormats.includes(config.format)) {
    throw new Error(`Invalid format: ${config.format}. Must be one of: ${validFormats.join(', ')}`);
  }

  // Validate style
  const validStyles = ['concise', 'detailed'];
  if (!validStyles.includes(config.style)) {
    throw new Error(`Invalid style: ${config.style}. Must be one of: ${validStyles.join(', ')}`);
  }

  // Validate output path
  if (!config.output || typeof config.output !== 'string') {
    throw new Error('Output path must be a non-empty string');
  }

  // Validate ignore patterns
  if (!Array.isArray(config.ignore)) {
    throw new Error('Ignore patterns must be an array');
  }

  logger.debug('Configuration validation passed');
}

export function getDefaultConfig(): ConfigOptions {
  return { ...DEFAULT_CONFIG };
}

export async function createExampleConfig(outputPath: string = './autodocs.config.js'): Promise<void> {
  const exampleConfig = `
// Auto-Docs Configuration File
// See https://github.com/your-username/auto-docs for full documentation

export default {
  // AI provider to use for documentation generation
  // Options: 'openai' | 'ollama'
  ai: 'openai',

  // Output format for generated documentation
  // Options: 'markdown' | 'html' | 'json'
  format: 'markdown',

  // Documentation style
  // Options: 'concise' | 'detailed'
  style: 'detailed',

  // Output directory for generated documentation
  output: './docs',

  // Patterns to ignore when scanning files
  ignore: [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'build/**',
    '*.min.js',
    '*.test.*',
    '*.spec.*',
    '__tests__/**',
    '__mocks__/**'
  ]
};
  `.trim();

  await fs.writeFile(outputPath, exampleConfig, 'utf-8');
  logger.info(`Example configuration created: ${outputPath}`);
}
