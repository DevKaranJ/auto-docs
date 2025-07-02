export type AIProvider = 'openai' | 'ollama';
export type DocumentationStyle = 'concise' | 'detailed';
export type OutputFormat = 'markdown' | 'html' | 'json';
export type Language = 'javascript' | 'typescript' | 'python' | 'go';

export interface FunctionInfo {
  name: string;
  parameters: string[];
  returnType: string;
  docstring: string | null;
  body: string | null;
}

export interface ClassInfo {
  name: string;
  methods: FunctionInfo[];
  docstring: string | null;
}

export interface ParsedFile {
  path: string;
  language: Language;
  functions: FunctionInfo[];
  classes: ClassInfo[];
  exports: string[];
  imports: string[];
  comments: string[];
}

export interface AutoDocsConfig {
  ai: AIProvider;
  ignore: string[];
  style: DocumentationStyle;
  output: string;
  format: OutputFormat;
}

export interface GenerateOptions {
  output: string;
  format: OutputFormat;
  config: string;
  style: DocumentationStyle;
  ai: AIProvider;
  dryRun?: boolean;
  verbose?: boolean;
}

export interface WatchOptions extends GenerateOptions {
  debounce: string;
}
