#!/usr/bin/env node

import { Command } from 'commander';
import { generateCommand } from './commands/generate.js';
import { watchCommand } from './commands/watch.js';
import chalk from 'chalk';

const program = new Command();

// ASCII Art Banner
const banner = `
  ╭─────────────────────────────────────────────╮
  │                                             │
  │     🤖 Auto-Docs - AI-Powered Docs         │
  │     Generate documentation automatically    │
  │                                             │
  ╰─────────────────────────────────────────────╯
`;

program
  .name('auto-docs')
  .description('AI-powered documentation generator')
  .version('1.0.0')
  .addHelpText('beforeAll', chalk.cyan(banner))
  .addHelpText('afterAll', '\n' + chalk.gray('💡 Tip: Use --help with any command for more details'))
  .configureOutput({
    writeErr: (str) => process.stderr.write(chalk.red(str)),
    writeOut: (str) => process.stdout.write(str),
  });

// Generate command
program
  .command('generate')
  .alias('gen')
  .description('Generate documentation for your codebase')
  .argument('[source]', 'Source directory to analyze', './src')
  .option('-o, --output <path>', 'Output directory', './docs')
  .option('-f, --format <type>', 'Output format (markdown|html|json)', 'markdown')
  .option('-c, --config <path>', 'Config file path', './autodocs.config.js')
  .option('-s, --style <type>', 'Documentation style (concise|detailed)', 'detailed')
  .option('--ai <provider>', 'AI provider (openai|ollama)', 'openai')
  .option('--dry-run', 'Preview what files would be processed without generating docs')
  .option('--verbose', 'Enable verbose logging')
  .action(generateCommand);

// Watch command
program
  .command('watch')
  .description('Watch for file changes and regenerate docs automatically')
  .argument('[source]', 'Source directory to watch', './src')
  .option('-o, --output <path>', 'Output directory', './docs')
  .option('-f, --format <type>', 'Output format (markdown|html|json)', 'markdown')
  .option('-c, --config <path>', 'Config file path', './autodocs.config.js')
  .option('-s, --style <type>', 'Documentation style (concise|detailed)', 'detailed')
  .option('--ai <provider>', 'AI provider (openai|ollama)', 'openai')
  .option('--debounce <ms>', 'Debounce delay in milliseconds', '1000')
  .action(watchCommand);

// Fun help message for --help meme
program
  .command('help-me')
  .description('You help AI, AI helps you 🤖')
  .action(() => {
    console.log(chalk.cyan(`
    ┌─────────────────────────────────────────┐
    │  You: Write my docs                     │
    │  AI: Here are your beautiful docs ✨    │
    │  You: Thanks AI! ⭐                     │
    │  AI: You're welcome, human friend! 🤖   │
    └─────────────────────────────────────────┘
    `));
    console.log(chalk.yellow('💡 Try: npx auto-docs generate --help'));
  });

// Handle unknown commands with a fun message
program
  .command('*', { hidden: true })
  .action((cmd) => {
    console.log(chalk.red(`❌ Unknown command: ${cmd}`));
    console.log(chalk.yellow(`🤔 Did you mean one of these?`));
    console.log(chalk.gray('  • auto-docs generate'));
    console.log(chalk.gray('  • auto-docs watch'));
    console.log(chalk.gray('  • auto-docs help-me'));
  });

// Error handling
process.on('uncaughtException', (error) => {
  console.error(chalk.red('💥 Oops! Something went wrong:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('🚨 Unhandled promise rejection:'), reason);
  process.exit(1);
});

program.parse();
