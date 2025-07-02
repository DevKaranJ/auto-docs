import { resolve, join } from 'path';
import chalk from 'chalk';
import { loadConfig } from '../services/config.js';
import { scanFiles } from '../utils/file-scanner.js';
import { parseFiles } from '../services/parser.js';
import { generateDocumentation } from '../services/openai.js';
import { writeOutput } from '../services/output.js';
import { createProgressBar } from '../utils/progress.js';
import type { GenerateOptions } from '../types/index.js';

export async function generateCommand(
  source: string,
  options: GenerateOptions
): Promise<void> {
  console.log(chalk.cyan('\n🚀 Starting Auto-Docs generation...\n'));

  try {
    // Load configuration
    const config = await loadConfig(options.config);
    const mergedOptions = { ...config, ...options };

    if (options.verbose) {
      console.log(chalk.gray('📋 Configuration:'));
      console.log(chalk.gray(JSON.stringify(mergedOptions, null, 2)));
      console.log();
    }

    // Resolve paths
    const sourcePath = resolve(source);
    const outputPath = resolve(options.output);

    console.log(chalk.blue(`📁 Scanning files in: ${sourcePath}`));

    // Scan for files
    const files = await scanFiles(sourcePath, mergedOptions.ignore || []);
    
    if (files.length === 0) {
      console.log(chalk.yellow('⚠️  No files found to process'));
      return;
    }

    console.log(chalk.green(`✅ Found ${files.length} files to process`));

    if (options.dryRun) {
      console.log(chalk.cyan('\n🔍 Dry run - Files that would be processed:'));
      files.forEach(file => console.log(chalk.gray(`  • ${file}`)));
      return;
    }

    // Parse files
    console.log(chalk.blue('\n📖 Parsing code files...'));
    const parsedFiles = await parseFiles(files, options.verbose);

    if (parsedFiles.length === 0) {
      console.log(chalk.yellow('⚠️  No code structures found to document'));
      return;
    }

    // Generate documentation with AI
    console.log(chalk.blue('\n🤖 Generating AI-powered documentation...'));
    const progressBar = createProgressBar(parsedFiles.length, 'Generating docs');
    
    const documentedFiles: Array<typeof parsedFiles[0] & { documentation: string }> = [];
    
    for (let i = 0; i < parsedFiles.length; i++) {
      const parsedFile = parsedFiles[i];
      
      try {
        const documentation = await generateDocumentation(
          parsedFile,
          mergedOptions.ai,
          mergedOptions.style
        );
        
        documentedFiles.push({
          ...parsedFile,
          documentation
        });
        
        progressBar.update(i + 1);
        
        if (options.verbose) {
          console.log(chalk.gray(`  ✅ ${parsedFile.path}`));
        }
      } catch (error) {
        console.log(chalk.red(`  ❌ Failed to generate docs for ${parsedFile.path}: ${error.message}`));
        if (options.verbose) {
          console.error(error);
        }
      }
    }

    progressBar.stop();

    if (documentedFiles.length === 0) {
      console.log(chalk.red('\n❌ Failed to generate any documentation'));
      return;
    }

    // Write output
    console.log(chalk.blue('\n📄 Writing documentation files...'));
    await writeOutput(documentedFiles, outputPath, options.format);

    // Success message
    console.log(chalk.green(`\n🎉 Successfully generated documentation!`));
    console.log(chalk.gray(`📁 Output: ${outputPath}`));
    console.log(chalk.gray(`📊 Processed: ${documentedFiles.length}/${files.length} files`));
    console.log(chalk.gray(`🎨 Format: ${options.format}`));
    console.log(chalk.gray(`🧠 AI Provider: ${mergedOptions.ai}`));
    
    if (documentedFiles.length < files.length) {
      const failed = files.length - documentedFiles.length;
      console.log(chalk.yellow(`⚠️  ${failed} files failed to process`));
    }

  } catch (error) {
    console.error(chalk.red('\n💥 Generation failed:'), error.message);
    if (options.verbose) {
      console.error(error);
    }
    process.exit(1);
  }
}
