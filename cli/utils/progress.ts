import chalk from 'chalk';

export interface ProgressBar {
  update(current: number): void;
  stop(): void;
}

export function createProgressBar(total: number, label: string = 'Progress'): ProgressBar {
  let lastRendered = '';

  const render = (current: number) => {
    const percentage = Math.round((current / total) * 100);
    const completed = Math.round((current / total) * 30);
    const remaining = 30 - completed;
    
    const bar = '█'.repeat(completed) + '░'.repeat(remaining);
    const line = `${chalk.blue(label)}: [${chalk.green(bar)}] ${percentage}% (${current}/${total})`;
    
    // Clear previous line and render new one
    if (lastRendered) {
      process.stdout.write('\r' + ' '.repeat(lastRendered.length) + '\r');
    }
    process.stdout.write(line);
    lastRendered = line;
  };

  return {
    update: render,
    stop: () => {
      if (lastRendered) {
        process.stdout.write('\n');
      }
    }
  };
}

export function createSpinner(message: string): { stop: () => void } {
  const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let index = 0;
  let spinning = true;

  const spin = () => {
    if (!spinning) return;
    
    process.stdout.write(`\r${chalk.cyan(spinnerChars[index])} ${message}`);
    index = (index + 1) % spinnerChars.length;
    setTimeout(spin, 100);
  };

  spin();

  return {
    stop: () => {
      spinning = false;
      process.stdout.write('\r' + ' '.repeat(message.length + 3) + '\r');
    }
  };
}
