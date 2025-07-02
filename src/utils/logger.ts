import chalk from 'chalk';

export interface LogLevel {
  DEBUG: number;
  INFO: number;
  WARN: number;
  ERROR: number;
  SUCCESS: number;
}

const LOG_LEVELS: LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SUCCESS: 1
};

class Logger {
  private currentLevel: number = LOG_LEVELS.INFO;

  constructor() {
    // Set log level from environment variable
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    if (envLevel && envLevel in LOG_LEVELS) {
      this.currentLevel = LOG_LEVELS[envLevel as keyof LogLevel];
    }
  }

  setLevel(level: keyof LogLevel): void {
    this.currentLevel = LOG_LEVELS[level];
  }

  private shouldLog(level: number): boolean {
    return level >= this.currentLevel;
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] [${level}]`;
    const fullMessage = args.length > 0 ? `${message} ${args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ')}` : message;
    
    return `${prefix} ${fullMessage}`;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(chalk.gray(this.formatMessage('DEBUG', message, ...args)));
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      console.log(chalk.blue(this.formatMessage('INFO', message, ...args)));
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.WARN)) {
      console.warn(chalk.yellow(this.formatMessage('WARN', message, ...args)));
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      console.error(chalk.red(this.formatMessage('ERROR', message, ...args)));
    }
  }

  success(message: string, ...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.SUCCESS)) {
      console.log(chalk.green(this.formatMessage('SUCCESS', message, ...args)));
    }
  }

  // Progress and spinners for better CLI experience
  progress(current: number, total: number, message?: string): void {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;

    const percentage = Math.round((current / total) * 100);
    const barLength = 20;
    const filledLength = Math.round((percentage / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    const progressMessage = message ? ` ${message}` : '';
    const line = `\r${chalk.blue('[INFO]')} Progress: [${chalk.cyan(bar)}] ${percentage}%${progressMessage}`;
    
    process.stdout.write(line);
    
    if (current === total) {
      process.stdout.write('\n');
    }
  }

  // Special formatting for fun messages as mentioned in roadmap
  meme(message: string): void {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      console.log(chalk.magenta.bold(`🤖 ${message} 🤖`));
    }
  }

  // CLI-specific formatting
  command(command: string, description: string): void {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      console.log(`${chalk.cyan(command.padEnd(30))} ${chalk.gray(description)}`);
    }
  }

  // Error with suggestions (fun error messages as per roadmap)
  errorWithSuggestion(message: string, suggestion: string): void {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      console.error(chalk.red(this.formatMessage('ERROR', message)));
      console.error(chalk.yellow(`💡 Suggestion: ${suggestion}`));
    }
  }

  // Oops messages for fun error handling
  oops(message: string): void {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      const funMessages = [
        'Oops, AI forgot to document this. Try again? 🤔',
        'Houston, we have a documentation problem! 🚀',
        'The AI went for coffee, please try again ☕',
        'Documentation.exe has stopped working 💻'
      ];
      
      const randomFun = funMessages[Math.floor(Math.random() * funMessages.length)];
      console.error(chalk.red(this.formatMessage('OOPS', message)));
      console.error(chalk.yellow(randomFun));
    }
  }
}

export const logger = new Logger();

// Helper function for CLI spinners and loading states
export class Spinner {
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private interval: NodeJS.Timeout | null = null;
  private frameIndex = 0;
  private message: string;
  private isSpinning = false;

  constructor(message: string = 'Loading...') {
    this.message = message;
  }

  start(): void {
    if (this.isSpinning) return;
    
    this.isSpinning = true;
    this.interval = setInterval(() => {
      process.stdout.write(`\r${chalk.cyan(this.frames[this.frameIndex])} ${this.message}`);
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    }, 100);
  }

  stop(finalMessage?: string): void {
    if (!this.isSpinning) return;
    
    this.isSpinning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    process.stdout.write('\r' + ' '.repeat(this.message.length + 10) + '\r');
    
    if (finalMessage) {
      logger.success(finalMessage);
    }
  }

  fail(errorMessage?: string): void {
    this.stop();
    if (errorMessage) {
      logger.error(errorMessage);
    }
  }
}
