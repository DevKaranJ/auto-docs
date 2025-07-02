import { Command } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';
import { scanFiles } from '../../utils/file-scanner.js';
import { loadConfig } from '../../utils/config-loader.js';
import { parseCode } from '../../core/parsers/index.js';
import { generateDocumentation } from '../../core/generators/index.js';
import { OpenAIClient } from '../../core/ai/openai-client.js';
import { logger } from '../../utils/logger.js';
import type { ConfigOptions, DocumentationFormat } from '../../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateCommand = new Command('generate')
  .description('Generate AI-powered documentation for your codebase')
  .argument('<source>', 'Source directory or file to document')
  .option('-o, --output <path>', 'Output directory for generated docs', './docs')
  .option('-f, --format <format>', 'Output format: markdown, html, json', 'markdown')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('--style <style>', 'Documentation style: concise, detailed', 'detailed')
  .option('--ai <provider>', 'AI provider: openai, ollama', 'openai')
  .action(async (source: string, options) => {
    try {
      logger.info('🚀 Starting documentation generation...');
      
      // Load configuration
      const config: ConfigOptions = await loadConfig(options.config);
      
      // Override config with CLI options
      const finalConfig: ConfigOptions = {
        ...config,
        ai: options.ai || config.ai || 'openai',
        format: options.format as DocumentationFormat || config.format || 'markdown',
        style: options.style || config.style || 'detailed',
        output: options.output || config.output || './docs',
        ignore: config.ignore || []
      };

      // Validate AI provider
      if (finalConfig.ai === 'openai') {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error('OPENAI_API_KEY environment variable is required when using OpenAI');
        }
      } else if (finalConfig.ai === 'ollama') {
        logger.warn('Ollama support is planned for future release. Using OpenAI for now.');
        finalConfig.ai = 'openai';
      }

      // Initialize AI client
      const aiClient = new OpenAIClient();

      // Scan for files
      logger.info('📁 Scanning files...');
      const files = await scanFiles(source, {
        ignore: finalConfig.ignore,
        supportedExtensions: ['.js', '.jsx', '.ts', '.tsx', '.py', '.go']
      });

      if (files.length === 0) {
        logger.warn('No supported files found in the specified directory.');
        return;
      }

      logger.info(`Found ${files.length} files to process`);

      // Parse and generate documentation for each file
      const documentationResults = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progress = `[${i + 1}/${files.length}]`;
        
        try {
          logger.info(`${progress} Processing ${file}`);
          
          // Parse the code file
          const parsedCode = await parseCode(file);
          
          if (parsedCode.functions.length === 0 && parsedCode.classes.length === 0) {
            logger.debug(`${progress} Skipping ${file} - no documentable code found`);
            continue;
          }

          // Generate AI-powered documentation
          const documentation = await aiClient.generateDocumentation(parsedCode, {
            style: finalConfig.style,
            includeExamples: true,
            format: 'structured'
          });

          documentationResults.push({
            file,
            parsedCode,
            documentation
          });

        } catch (error) {
          logger.error(`${progress} Failed to process ${file}:`, error.message);
          continue;
        }
      }

      if (documentationResults.length === 0) {
        logger.warn('No documentation could be generated from the processed files.');
        return;
      }

      // Generate output files
      logger.info('📝 Generating documentation files...');
      await generateDocumentation(documentationResults, {
        format: finalConfig.format,
        outputPath: finalConfig.output,
        style: finalConfig.style
      });

      logger.success(`✨ Documentation generated successfully in ${finalConfig.output}/`);
      logger.info(`📊 Processed ${documentationResults.length} files`);

    } catch (error) {
      logger.error('Generation failed:', error.message);
      process.exit(1);
    }
  });
