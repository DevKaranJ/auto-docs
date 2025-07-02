#!/usr/bin/env node

import { cli } from '../src/cli/index.js';

cli().catch((error) => {
  console.error('Auto-Docs CLI Error:', error.message);
  process.exit(1);
});
