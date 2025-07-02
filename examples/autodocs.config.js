// Auto-Docs Configuration File
// Complete example configuration with all available options

export default {
  // AI provider to use for documentation generation
  // Options: 'openai' | 'ollama'
  // Default: 'openai'
  ai: 'openai',

  // Output format for generated documentation
  // Options: 'markdown' | 'html' | 'json'
  // Default: 'markdown'
  format: 'markdown',

  // Documentation style and detail level
  // Options: 'concise' | 'detailed'
  // Default: 'detailed'
  style: 'detailed',

  // Output directory for generated documentation
  // Default: './docs'
  output: './docs',

  // Patterns to ignore when scanning files
  // Uses glob patterns - supports ** for deep matching
  ignore: [
    // Dependencies
    'node_modules/**',
    'vendor/**',
    '.git/**',
    
    // Build outputs
    'dist/**',
    'build/**',
    'out/**',
    '*.min.js',
    '*.bundle.js',
    
    // Test files
    '*.test.*',
    '*.spec.*',
    '__tests__/**',
    '__mocks__/**',
    'test/**',
    'tests/**',
    
    // Configuration files
    '*.config.js',
    '*.config.ts',
    '.env*',
    
    // Documentation (to avoid recursion)
    'docs/**',
    'README.md',
    
    // IDE and temp files
    '.vscode/**',
    '.idea/**',
    '*.tmp',
    '*.temp',
    
    // Language-specific
    '*.d.ts',      // TypeScript declarations
    '__pycache__/**', // Python cache
  ],

  // Advanced OpenAI configuration (optional)
  openai: {
    // Model to use (gpt-4o is recommended)
    model: 'gpt-4o',
    
    // Temperature for generation (0.0 = deterministic, 1.0 = creative)
    temperature: 0.3,
    
    // Maximum tokens in response
    maxTokens: 4000,
    
    // Custom API endpoint (if using Azure OpenAI or similar)
    // apiEndpoint: 'https://your-custom-endpoint.openai.azure.com/',
    
    // Organization ID (optional)
    // organization: 'org-xxxxxxxxxxxxxxx'
  },

  // File processing options
  processing: {
    // Maximum file size to process (in bytes)
    maxFileSize: 10 * 1024 * 1024, // 10MB
    
    // Follow symbolic links
    followSymlinks: false,
    
    // Encoding for reading files
    encoding: 'utf-8',
    
    // Batch size for processing files
    batchSize: 5
  },

  // Output customization
  output_options: {
    // Include source code snippets in documentation
    includeSourceCode: false,
    
    // Include file statistics
    includeStats: true,
    
    // Generate table of contents
    generateToc: true,
    
    // Include examples in function documentation
    includeExamples: true,
    
    // Custom templates directory
    // templatesDir: './custom-templates'
  },

  // Language-specific settings
  languages: {
    javascript: {
      // Parse JSDoc comments
      parseJSDoc: true,
      
      // Include private functions (those starting with _)
      includePrivate: false
    },
    
    typescript: {
      // Parse TSDoc comments
      parseTSDoc: true,
      
      // Include type information in documentation
      includeTypes: true,
      
      // Include interface definitions
      includeInterfaces: true
    },
    
    python: {
      // Parse docstrings
      parseDocstrings: true,
      
      // Include type hints
      includeTypeHints: true,
      
      // Include dunder methods
      includeDunderMethods: false
    },
    
    go: {
      // Parse Go doc comments
      parseGoDoc: true,
      
      // Include unexported functions
      includeUnexported: false
    }
  },

  // Hooks for custom processing (advanced)
  hooks: {
    // Called before processing each file
    beforeParse: async (filePath, content) => {
      console.log(`Processing ${filePath}...`);
      return content; // Return modified content or original
    },
    
    // Called after parsing but before AI generation
    afterParse: async (parsedCode) => {
      // Custom logic to modify parsed code
      return parsedCode;
    },
    
    // Called after AI generation but before writing
    beforeWrite: async (documentation) => {
      // Custom logic to modify generated documentation
      return documentation;
    },
    
    // Called after writing documentation
    afterWrite: async (outputPath) => {
      console.log(`Documentation written to ${outputPath}`);
    }
  },

  // Plugin configuration (for future extensibility)
  plugins: [
    // Example plugin configurations
    // 'auto-docs-plugin-mermaid',
    // ['auto-docs-plugin-custom', { option: 'value' }]
  ],

  // Experimental features (use with caution)
  experimental: {
    // Use streaming for faster generation
    streaming: false,
    
    // Generate multiple output formats simultaneously
    multiFormat: false,
    
    // Use local AI models via Ollama
    localAI: false
  }
};

// Alternative configuration formats:

// Minimal configuration
/*
export default {
  ai: 'openai',
  format: 'markdown',
  output: './docs'
};
*/

// Project-specific configuration examples:

// For a React project
/*
export default {
  format: 'html',
  style: 'detailed',
  ignore: [
    'node_modules/**',
    'build/**',
    'public/**',
    '*.test.js',
    '*.test.jsx'
  ],
  languages: {
    javascript: {
      parseJSDoc: true,
      includePrivate: false
    }
  }
};
*/

// For a Python project
/*
export default {
  format: 'markdown',
  style: 'detailed',
  ignore: [
    '__pycache__/**',
    'venv/**',
    '.venv/**',
    'dist/**',
    '*.pyc',
    'test_*.py'
  ],
  languages: {
    python: {
      parseDocstrings: true,
      includeTypeHints: true,
      includeDunderMethods: false
    }
  }
};
*/

// For a Go project
/*
export default {
  format: 'html',
  style: 'concise',
  ignore: [
    'vendor/**',
    'bin/**',
    '*_test.go'
  ],
  languages: {
    go: {
      parseGoDoc: true,
      includeUnexported: false
    }
  }
};
*/
