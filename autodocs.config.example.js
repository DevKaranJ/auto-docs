/**
 * Auto-Docs Configuration File
 * 
 * This file configures how Auto-Docs generates documentation for your codebase.
 * Copy this file to `autodocs.config.js` and customize as needed.
 */

export default {
  // AI provider to use for documentation generation
  ai: "openai", // "openai" | "ollama"
  
  // Files and directories to ignore
  ignore: [
    "node_modules/**",
    ".git/**",
    "dist/**",
    "build/**",
    "**/*.test.*",
    "**/*.spec.*",
    "**/test/**",
    "**/tests/**",
    "coverage/**",
    ".next/**",
    ".nuxt/**"
  ],
  
  // Documentation style
  style: "detailed", // "concise" | "detailed"
  
  // Default output directory
  output: "./docs",
  
  // Default output format
  format: "markdown", // "markdown" | "html" | "json"
  
  // OpenAI specific configuration (optional)
  openai: {
    model: "gpt-4o", // Default model to use
    temperature: 0.3, // Lower = more consistent, Higher = more creative
    maxTokens: 2000
  },
  
  // Ollama specific configuration (optional)
  ollama: {
    model: "llama2", // Local model to use
    baseUrl: "http://localhost:11434"
  },
  
  // Custom templates (advanced usage)
  templates: {
    // Path to custom markdown template
    markdown: null,
    // Path to custom HTML template
    html: null
  },
  
  // Language-specific settings
  languages: {
    javascript: {
      include: ["**/*.js", "**/*.jsx"],
      exclude: ["**/*.min.js"]
    },
    typescript: {
      include: ["**/*.ts", "**/*.tsx"],
      exclude: ["**/*.d.ts"]
    },
    python: {
      include: ["**/*.py"],
      exclude: ["**/venv/**", "**/__pycache__/**"]
    },
    go: {
      include: ["**/*.go"],
      exclude: ["**/vendor/**"]
    }
  }
};
