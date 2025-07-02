import { readFile } from 'fs/promises';
import { extname, basename } from 'path';
import { parse } from '@babel/parser';
import chalk from 'chalk';
import type { ParsedFile, FunctionInfo, ClassInfo } from '../types/index.js';

export async function parseFiles(filePaths: string[], verbose: boolean = false): Promise<ParsedFile[]> {
  const parsedFiles: ParsedFile[] = [];

  for (const filePath of filePaths) {
    try {
      const parsed = await parseFile(filePath);
      if (parsed) {
        parsedFiles.push(parsed);
        if (verbose) {
          console.log(chalk.gray(`  ✅ Parsed: ${filePath}`));
        }
      }
    } catch (error) {
      if (verbose) {
        console.log(chalk.red(`  ❌ Failed to parse: ${filePath} - ${error.message}`));
      }
    }
  }

  return parsedFiles;
}

export async function parseFile(filePath: string): Promise<ParsedFile | null> {
  const extension = extname(filePath).toLowerCase();
  const content = await readFile(filePath, 'utf-8');

  if (content.trim().length === 0) {
    return null;
  }

  switch (extension) {
    case '.js':
    case '.jsx':
      return parseJavaScript(filePath, content);
    case '.ts':
    case '.tsx':
      return parseTypeScript(filePath, content);
    case '.py':
      return parsePython(filePath, content);
    case '.go':
      return parseGo(filePath, content);
    default:
      return null;
  }
}

function parseJavaScript(filePath: string, content: string): ParsedFile {
  return parseJSLike(filePath, content, 'javascript');
}

function parseTypeScript(filePath: string, content: string): ParsedFile {
  return parseJSLike(filePath, content, 'typescript');
}

function parseJSLike(filePath: string, content: string, language: 'javascript' | 'typescript'): ParsedFile {
  const functions: FunctionInfo[] = [];
  const classes: ClassInfo[] = [];
  const exports: string[] = [];
  const imports: string[] = [];
  const comments: string[] = [];

  try {
    const ast = parse(content, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript',
        'decorators-legacy',
        'classProperties',
        'objectRestSpread',
        'functionBind',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'dynamicImport',
        'nullishCoalescingOperator',
        'optionalChaining'
      ]
    });

    // Extract imports
    ast.program.body.forEach(node => {
      if (node.type === 'ImportDeclaration') {
        imports.push(`${node.source.value}${node.specifiers.length > 0 ? ` (${node.specifiers.map(s => s.local.name).join(', ')})` : ''}`);
      }
    });

    // Extract exports, functions, and classes
    ast.program.body.forEach(node => {
      if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
        if (node.declaration) {
          if (node.declaration.type === 'FunctionDeclaration') {
            const func = extractFunctionInfo(node.declaration);
            if (func) {
              functions.push(func);
              exports.push(func.name);
            }
          } else if (node.declaration.type === 'ClassDeclaration') {
            const cls = extractClassInfo(node.declaration);
            if (cls) {
              classes.push(cls);
              exports.push(cls.name);
            }
          } else if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations.forEach(decl => {
              if (decl.id.type === 'Identifier') {
                exports.push(decl.id.name);
              }
            });
          }
        }
      } else if (node.type === 'FunctionDeclaration') {
        const func = extractFunctionInfo(node);
        if (func) functions.push(func);
      } else if (node.type === 'ClassDeclaration') {
        const cls = extractClassInfo(node);
        if (cls) classes.push(cls);
      }
    });

    // Extract comments
    if (ast.comments) {
      ast.comments.forEach(comment => {
        const text = comment.value.trim();
        if (text.length > 10) { // Only meaningful comments
          comments.push(text);
        }
      });
    }

  } catch (error) {
    // If parsing fails, try to extract basic info with regex
    return extractWithRegex(filePath, content, language);
  }

  return {
    path: filePath,
    language,
    functions,
    classes,
    exports,
    imports,
    comments
  };
}

function extractFunctionInfo(node: any): FunctionInfo | null {
  if (!node.id || !node.id.name) return null;

  const parameters: string[] = [];
  let returnType = 'unknown';

  // Extract parameters
  if (node.params) {
    node.params.forEach(param => {
      if (param.type === 'Identifier') {
        parameters.push(param.name);
      } else if (param.type === 'AssignmentPattern' && param.left.type === 'Identifier') {
        parameters.push(param.left.name);
      }
    });
  }

  // Extract return type for TypeScript
  if (node.returnType && node.returnType.typeAnnotation) {
    returnType = 'annotated'; // Simplified for now
  }

  return {
    name: node.id.name,
    parameters,
    returnType,
    docstring: null, // JSDoc extraction would go here
    body: null
  };
}

function extractClassInfo(node: any): ClassInfo | null {
  if (!node.id || !node.id.name) return null;

  const methods: FunctionInfo[] = [];

  if (node.body && node.body.body) {
    node.body.body.forEach(member => {
      if (member.type === 'MethodDefinition' && member.key.type === 'Identifier') {
        const method: FunctionInfo = {
          name: member.key.name,
          parameters: member.value.params.map(p => p.name || 'param').filter(Boolean),
          returnType: 'unknown',
          docstring: null,
          body: null
        };
        methods.push(method);
      }
    });
  }

  return {
    name: node.id.name,
    methods,
    docstring: null
  };
}

function parsePython(filePath: string, content: string): ParsedFile {
  const functions: FunctionInfo[] = [];
  const classes: ClassInfo[] = [];
  const exports: string[] = [];
  const imports: string[] = [];
  const comments: string[] = [];

  // Use regex patterns for Python parsing (simplified)
  const functionRegex = /def\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?:/g;
  const classRegex = /class\s+(\w+)(?:\([^)]*\))?:/g;
  const importRegex = /^(?:from\s+\S+\s+)?import\s+(.+)$/gm;
  const commentRegex = /^\s*#\s*(.+)$/gm;
  const docstringRegex = /"""([^"]*(?:"[^"]*)*[^"]*)"""/g;

  // Extract functions
  let match;
  while ((match = functionRegex.exec(content)) !== null) {
    const name = match[1];
    const params = match[2] ? match[2].split(',').map(p => p.trim().split('=')[0].trim()) : [];
    const returnType = match[3] ? match[3].trim() : 'unknown';
    
    functions.push({
      name,
      parameters: params,
      returnType,
      docstring: null,
      body: null
    });
    exports.push(name);
  }

  // Extract classes
  while ((match = classRegex.exec(content)) !== null) {
    const name = match[1];
    classes.push({
      name,
      methods: [], // Would need more complex parsing
      docstring: null
    });
    exports.push(name);
  }

  // Extract imports
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1].trim());
  }

  // Extract comments
  while ((match = commentRegex.exec(content)) !== null) {
    const comment = match[1].trim();
    if (comment.length > 10) {
      comments.push(comment);
    }
  }

  return {
    path: filePath,
    language: 'python',
    functions,
    classes,
    exports,
    imports,
    comments
  };
}

function parseGo(filePath: string, content: string): ParsedFile {
  const functions: FunctionInfo[] = [];
  const classes: ClassInfo[] = [];
  const exports: string[] = [];
  const imports: string[] = [];
  const comments: string[] = [];

  // Use regex patterns for Go parsing (simplified)
  const functionRegex = /func\s+(?:\([^)]*\)\s+)?(\w+)\s*\(([^)]*)\)(?:\s*([^{]+))?/g;
  const importRegex = /import\s+(?:\(\s*([\s\S]*?)\s*\)|"([^"]+)"|\w+\s+"([^"]+)")/g;
  const commentRegex = /^\s*\/\/\s*(.+)$/gm;
  const structRegex = /type\s+(\w+)\s+struct/g;

  // Extract functions
  let match;
  while ((match = functionRegex.exec(content)) !== null) {
    const name = match[1];
    const params = match[2] ? match[2].split(',').map(p => p.trim().split(' ')[0]).filter(Boolean) : [];
    const returnType = match[3] ? match[3].trim() : 'unknown';
    
    functions.push({
      name,
      parameters: params,
      returnType,
      docstring: null,
      body: null
    });
    
    // Go exports are determined by capitalization
    if (name[0] === name[0].toUpperCase()) {
      exports.push(name);
    }
  }

  // Extract structs (Go's equivalent to classes)
  while ((match = structRegex.exec(content)) !== null) {
    const name = match[1];
    classes.push({
      name,
      methods: [], // Would need more complex parsing
      docstring: null
    });
    
    if (name[0] === name[0].toUpperCase()) {
      exports.push(name);
    }
  }

  // Extract imports
  while ((match = importRegex.exec(content)) !== null) {
    if (match[1]) {
      // Multi-line import
      const multiImports = match[1].split('\n').map(line => line.trim().replace(/"/g, '')).filter(Boolean);
      imports.push(...multiImports);
    } else {
      // Single import
      const importPath = match[2] || match[3];
      if (importPath) imports.push(importPath);
    }
  }

  // Extract comments
  while ((match = commentRegex.exec(content)) !== null) {
    const comment = match[1].trim();
    if (comment.length > 10) {
      comments.push(comment);
    }
  }

  return {
    path: filePath,
    language: 'go',
    functions,
    classes,
    exports,
    imports,
    comments
  };
}

function extractWithRegex(filePath: string, content: string, language: 'javascript' | 'typescript' | 'python' | 'go'): ParsedFile {
  // Fallback regex-based extraction for when AST parsing fails
  const functions: FunctionInfo[] = [];
  const classes: ClassInfo[] = [];
  const exports: string[] = [];
  const imports: string[] = [];
  const comments: string[] = [];

  // Basic function extraction
  const funcRegex = /(?:function\s+|const\s+\w+\s*=\s*(?:async\s+)?(?:function|\()|async\s+function\s+)(\w+)/g;
  let match;
  while ((match = funcRegex.exec(content)) !== null) {
    functions.push({
      name: match[1],
      parameters: [],
      returnType: 'unknown',
      docstring: null,
      body: null
    });
  }

  // Basic comment extraction
  const commentRegex = /\/\/\s*(.+)|\/\*\s*([\s\S]*?)\s*\*\//g;
  while ((match = commentRegex.exec(content)) !== null) {
    const comment = (match[1] || match[2]).trim();
    if (comment.length > 10) {
      comments.push(comment);
    }
  }

  return {
    path: filePath,
    language,
    functions,
    classes,
    exports,
    imports,
    comments
  };
}
