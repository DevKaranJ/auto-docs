import { Command } from 'commander';
import { generateCommand } from './commands/generate.js';
import { watchCommand } from './commands/watch.js';
import { logger } from '../utils/logger.js';

export async function cli() {
  const program = new Command();

  program
    .name('auto-docs')
    .description('🤖📄 AI-powered documentation generator')
    .version('1.0.0');

  // Fun help message as mentioned in the roadmap
  program.on('--help', () => {
    console.log('');
    console.log('💡 You help AI, AI helps you!');
    console.log('');
    console.log('Examples:');
    console.log('  $ npx auto-docs generate ./src --output ./docs --format markdown');
    console.log('  $ npx auto-docs watch ./src');
    console.log('  $ npx auto-docs generate . --config ./autodocs.config.js');
  });

  // Add commands
  program.addCommand(generateCommand);
  program.addCommand(watchCommand);

  // Global error handling
  program.exitOverride((err) => {
    if (err.code === 'commander.help') {
      process.exit(0);
    }
    logger.error('Command failed:', err.message);
    process.exit(1);
  });

  await program.parseAsync();
}
