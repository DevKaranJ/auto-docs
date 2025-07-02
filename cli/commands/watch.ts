import { resolve } from 'path';
import chalk from 'chalk';
import chokidar from 'chokidar';
import { debounce } from 'lodash-es';
import { loadConfig } from '../services/config.js';
import { generateCommand } from './generate.js';
import type { WatchOptions } from '../types/index.js';

export async function watchCommand(
  source: string,
  options: WatchOptions
): Promise<void> {
  console.log(chalk.cyan('\n👀 Starting Auto-Docs watch mode...\n'));

  try {
    // Load configuration
    const config = await loadConfig(options.config);
    const mergedOptions = { ...config, ...options };

    const sourcePath = resolve(source);
    const debounceMs = parseInt(options.debounce || '1000');

    console.log(chalk.blue(`📁 Watching: ${sourcePath}`));
    console.log(chalk.gray(`⏱️  Debounce: ${debounceMs}ms`));
    console.log(chalk.gray('🔄 Auto-regeneration enabled\n'));

    // Create debounced regeneration function
    const regenerateDocs = debounce(async () => {
      console.log(chalk.yellow('\n🔄 Files changed, regenerating documentation...\n'));
      
      try {
        await generateCommand(source, {
          ...options,
          verbose: false // Reduce noise in watch mode
        });
        console.log(chalk.green('\n✅ Documentation updated successfully!\n'));
        console.log(chalk.gray('👀 Watching for changes...'));
      } catch (error) {
        console.error(chalk.red('\n❌ Regeneration failed:'), error.message);
        console.log(chalk.gray('\n👀 Continuing to watch for changes...'));
      }
    }, debounceMs);

    // Set up file watcher
    const watchPatterns = [
      '**/*.js',
      '**/*.jsx',
      '**/*.ts',
      '**/*.tsx',
      '**/*.py',
      '**/*.go'
    ].map(pattern => `${sourcePath}/${pattern}`);

    const watcher = chokidar.watch(watchPatterns, {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        ...(mergedOptions.ignore || [])
      ],
      ignoreInitial: true,
      persistent: true
    });

    // Generate initial documentation
    console.log(chalk.blue('🚀 Generating initial documentation...\n'));
    await generateCommand(source, options);
    console.log(chalk.green('\n✅ Initial documentation generated!\n'));
    console.log(chalk.gray('👀 Watching for changes... (Press Ctrl+C to stop)'));

    // Set up event handlers
    watcher
      .on('add', (path) => {
        console.log(chalk.green(`➕ Added: ${path}`));
        regenerateDocs();
      })
      .on('change', (path) => {
        console.log(chalk.blue(`📝 Changed: ${path}`));
        regenerateDocs();
      })
      .on('unlink', (path) => {
        console.log(chalk.red(`➖ Removed: ${path}`));
        regenerateDocs();
      })
      .on('error', (error) => {
        console.error(chalk.red('👀 Watcher error:'), error);
      });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\n⏹️  Stopping watch mode...'));
      watcher.close().then(() => {
        console.log(chalk.green('✅ Watch mode stopped. Goodbye! 👋'));
        process.exit(0);
      });
    });

    // Keep the process alive
    process.stdin.resume();

  } catch (error) {
    console.error(chalk.red('\n💥 Watch mode failed to start:'), error.message);
    process.exit(1);
  }
}
