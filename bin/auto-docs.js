#!/usr/bin/env node

// This is the entry point for the npm package
// It imports and runs the TypeScript CLI
import('../cli/index.js').catch(error => {
  console.error('Failed to start Auto-Docs:', error.message);
  process.exit(1);
});
