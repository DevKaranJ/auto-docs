import { Command } from 'commander';
import chokidar from 'chokidar';
import path from 'path';
import { loadConfig } from '../../utils/config-loader.js';
import { logger } from '../../utils/logger.js';
import { generateCommand } from './generate.js';
import type { ConfigOptions } from '../../types/index.js';

export const watchCommand = new Command('watch')
  .description('Watch for file changes and regenerate documentation automatically')
  .argument('<source>', 'Source directory to watch')
  .option('-o, --output <path>', 'Output directory for generated docs', './docs')
  .option('-f, --format <format>', 'Output format: markdown, html, json', 'markdown')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('--style <style>', 'Documentation style: concise, detailed', 'detailed')
  .option('--ai <provider>', 'AI provider: openai, ollama', 'openai')
  .option('--debounce <ms>', 'Debounce delay in milliseconds', '1000')
  .action(async (source: string, options) => {
    try {
      logger.info('👀 Starting watch mode...');
      
      // Load configuration
      const config: ConfigOptions = await loadConfig(options.config);
      
      const watchConfig = {
        ...config,
        ai: options.ai || config.ai || 'openai',
        format: options.format || config.format || 'markdown',
        style: options.style || config.style || 'detailed',
        output: options.output || config.output || './docs',
        ignore: config.ignore || []
      };

      const debounceMs = parseInt(options.debounce) || 1000;
      let timeoutId: NodeJS.Timeout | null = null;
      let isGenerating = false;

      // Define file patterns to watch
      const watchPatterns = [
        path.join(source, '**/*.js'),
        path.join(source, '**/*.jsx'),
        path.join(source, '**/*.ts'),
        path.join(source, '**/*.tsx'),
        path.join(source, '**/*.py'),
        path.join(source, '**/*.go'),
      ];

      // Initialize file watcher
      const watcher = chokidar.watch(watchPatterns, {
        ignored: [
          ...watchConfig.ignore.map(pattern => path.join(source, pattern)),
          /node_modules/,
          /\.git/,
          /dist/,
          /build/,
          watchConfig.output // Don't watch the output directory
        ],
        ignoreInitial: true,
        persistent: true
      });

      const regenerateDocumentation = async (changedFile?: string) => {
        if (isGenerating) {
          logger.debug('Generation already in progress, skipping...');
          return;
        }

        try {
          isGenerating = true;
          
          if (changedFile) {
            logger.info(`📝 File changed: ${path.relative(process.cwd(), changedFile)}`);
          }
          
          logger.info('🔄 Regenerating documentation...');
          
          // Use the generate command logic
          const { execSync } = await import('child_process');
          const command = [
            'node',
            process.argv[1], // auto-docs binary
            'generate',
            source,
            '--output', watchConfig.output,
            '--format', watchConfig.format,
            '--style', watchConfig.style,
            '--ai', watchConfig.ai,
            ...(options.config ? ['--config', options.config] : [])
          ].join(' ');

          execSync(command, { 
            stdio: 'inherit',
            env: { ...process.env }
          });

        } catch (error) {
          logger.error('Failed to regenerate documentation:', error.message);
        } finally {
          isGenerating = false;
        }
      };

      // Handle file change events with debouncing
      const handleFileChange = (filePath: string, eventType: string) => {
        logger.debug(`File ${eventType}: ${path.relative(process.cwd(), filePath)}`);
        
        // Clear existing timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Set new timeout for debounced regeneration
        timeoutId = setTimeout(() => {
          regenerateDocumentation(filePath);
        }, debounceMs);
      };

      // Set up event listeners
      watcher
        .on('add', (filePath) => handleFileChange(filePath, 'added'))
        .on('change', (filePath) => handleFileChange(filePath, 'changed'))
        .on('unlink', (filePath) => handleFileChange(filePath, 'removed'))
        .on('error', (error) => logger.error('Watcher error:', error))
        .on('ready', () => {
          logger.success(`🎯 Watching for changes in: ${source}`);
          logger.info('💡 Press Ctrl+C to stop watching');
          
          // Generate initial documentation
          regenerateDocumentation();
        });

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        logger.info('\n🛑 Stopping watch mode...');
        watcher.close();
        process.exit(0);
      });

    } catch (error) {
      logger.error('Watch mode failed:', error.message);
      process.exit(1);
    }
  });
