// Core Types for Auto-Docs CLI

export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'go';
export type DocumentationFormat = 'markdown' | 'html' | 'json';
export type DocumentationStyle = 'concise' | 'detailed';
export type AIProvider = 'openai' | 'ollama';

// Configuration Types
export interface ConfigOptions {
  ai: AIProvider;
  format: DocumentationFormat;
  style: DocumentationStyle;
  output: string;
  ignore: string[];
  [key: string]: any; // Allow additional config options
}

// Code Parsing Types
export interface ParameterInfo {
  name: string;
  type: string;
  description?: string;
  defaultValue?: string;
  optional?: boolean;
}

export interface FunctionInfo {
  name: string;
  parameters: ParameterInfo[];
  returnType: string;
  isAsync: boolean;
  isGenerator: boolean;
  isStatic?: boolean;
  visibility?: 'public' | 'private' | 'protected';
  optional?: boolean;
  comments?: string | null;
  startLine: number;
  endLine: number;
}

export interface PropertyInfo {
  name: string;
  type: string;
  description?: string;
  isStatic?: boolean;
  visibility?: 'public' | 'private' | 'protected';
  optional?: boolean;
  comments?: string | null;
}

export interface ClassInfo {
  name: string;
  methods: FunctionInfo[];
  properties: PropertyInfo[];
  constructor: FunctionInfo | null;
  superClass: string | null;
  isInterface?: boolean;
  comments?: string | null;
  startLine: number;
  endLine: number;
}

export interface ImportSpecifier {
  name: string;
  type: 'default' | 'named' | 'namespace';
  imported?: string;
}

export interface ImportInfo {
  source: string;
  specifiers: ImportSpecifier[];
  startLine: number;
}

export interface ExportInfo {
  name: string;
  type: string;
  description?: string;
  typeDefinition?: string;
  startLine: number;
}

export interface ParsedCodeFile {
  filePath: string;
  language: SupportedLanguage;
  content: string;
  functions: FunctionInfo[];
  classes: ClassInfo[];
  imports: ImportInfo[];
  exports: ExportInfo[];
}

// AI Documentation Types
export interface GeneratedFunctionDoc {
  name: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  returns: {
    type: string;
    description: string;
  };
  example?: string;
}

export interface GeneratedClassDoc {
  name: string;
  description: string;
  methods: GeneratedFunctionDoc[];
  properties: Array<{
    name: string;
    type: string;
    description: string;
  }>;
}

export interface GeneratedExportDoc {
  name: string;
  type: string;
  description: string;
}

export interface GeneratedDocumentation {
  title: string;
  description: string;
  functions?: GeneratedFunctionDoc[];
  classes?: GeneratedClassDoc[];
  exports?: GeneratedExportDoc[];
  usage?: string;
  notes?: string;
}

// Generation Types
export interface DocumentationResult {
  file: string;
  parsedCode: ParsedCodeFile;
  documentation: GeneratedDocumentation;
}

export interface GenerationOptions {
  format: DocumentationFormat;
  outputPath: string;
  style: DocumentationStyle;
}

// CLI Types
export interface CLIOptions {
  source: string;
  output?: string;
  format?: DocumentationFormat;
  config?: string;
  style?: DocumentationStyle;
  ai?: AIProvider;
}

export interface WatchOptions extends CLIOptions {
  debounce?: string;
}

// Error Types
export interface AutoDocsError extends Error {
  code?: string;
  filePath?: string;
  suggestions?: string[];
}

// Progress Types
export interface ProcessingProgress {
  current: number;
  total: number;
  currentFile?: string;
  stage: 'scanning' | 'parsing' | 'generating' | 'writing';
}

// Template Types
export interface TemplateData {
  title: string;
  filePath: string;
  language: string;
  description: string;
  tableOfContents: string;
  functions: string;
  classes: string;
  exports: string;
  usage: string;
  notes: string;
  generatedDate: string;
}

// Statistics Types
export interface ProjectStats {
  totalFiles: number;
  totalFunctions: number;
  totalClasses: number;
  totalExports: number;
  languageBreakdown: Record<SupportedLanguage, number>;
  averageDocumentationScore?: number;
}

// API Types for Frontend Integration
export interface GenerateDocumentationRequest {
  source: string;
  options: {
    format: DocumentationFormat;
    style: DocumentationStyle;
    ai: AIProvider;
  };
}

export interface GenerateDocumentationResponse {
  success: boolean;
  documentation?: string;
  error?: string;
  stats?: ProjectStats;
}

// Demo Playground Types
export interface DemoCodeExample {
  id: string;
  name: string;
  language: SupportedLanguage;
  code: string;
  description: string;
}

export interface DemoResult {
  input: DemoCodeExample;
  output: GeneratedDocumentation;
  format: DocumentationFormat;
  processingTime: number;
}

// Configuration Validation Types
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// File System Types
export interface FileSystemNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  language?: SupportedLanguage;
  size?: number;
  children?: FileSystemNode[];
}

// OpenAI Integration Types
export interface OpenAIGenerationOptions {
  style: DocumentationStyle;
  includeExamples: boolean;
  format: 'structured' | 'markdown';
  temperature?: number;
  maxTokens?: number;
}

// Batch Processing Types
export interface BatchJob {
  id: string;
  files: string[];
  options: GenerationOptions;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: ProcessingProgress;
  startTime: Date;
  endTime?: Date;
  results?: DocumentationResult[];
  error?: string;
}

// Plugin System Types (for future extensibility)
export interface AutoDocsPlugin {
  name: string;
  version: string;
  initialize: (config: ConfigOptions) => Promise<void>;
  beforeParse?: (file: string, content: string) => Promise<string>;
  afterParse?: (parsedCode: ParsedCodeFile) => Promise<ParsedCodeFile>;
  beforeGenerate?: (parsedCode: ParsedCodeFile) => Promise<ParsedCodeFile>;
  afterGenerate?: (documentation: GeneratedDocumentation) => Promise<GeneratedDocumentation>;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Event Types for CLI
export interface CLIEvent {
  type: 'start' | 'progress' | 'complete' | 'error';
  data: any;
  timestamp: Date;
}

// Quality Metrics Types
export interface DocumentationQuality {
  completeness: number; // 0-100
  clarity: number; // 0-100
  examples: boolean;
  typeAnnotations: boolean;
  overallScore: number; // 0-100
}
