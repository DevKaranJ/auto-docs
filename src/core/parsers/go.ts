import type { ParsedCodeFile, FunctionInfo, ClassInfo, ImportInfo, ExportInfo } from '../../types/index.js';

export async function parseGo(content: string, baseResult: ParsedCodeFile): Promise<ParsedCodeFile> {
  try {
    // Go parsing using regex patterns (in production, consider using a Go AST parser)
    const result = { ...baseResult };

    // Parse Go imports
    result.imports = parseGoImports(content);
    
    // Parse Go functions
    result.functions = parseGoFunctions(content);
    
    // Parse Go structs (similar to classes)
    result.classes = parseGoStructs(content);
    
    // Parse Go exports (public functions/structs - those starting with capital letter)
    result.exports = parseGoExports(content, result.functions, result.classes);

    return result;

  } catch (error) {
    throw new Error(`Failed to parse Go: ${error.message}`);
  }
}

function parseGoImports(content: string): ImportInfo[] {
  const imports: ImportInfo[] = [];
  const lines = content.split('\n');

  let inImportBlock = false;
  let importBlockStart = -1;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Single import statement
    const singleImportMatch = trimmedLine.match(/^import\s+"([^"]+)"$/);
    if (singleImportMatch) {
      const importPath = singleImportMatch[1];
      const packageName = importPath.split('/').pop() || importPath;
      
      imports.push({
        source: importPath,
        specifiers: [{ name: packageName, type: 'default' }],
        startLine: index + 1
      });
      return;
    }

    // Import block start
    if (trimmedLine === 'import (') {
      inImportBlock = true;
      importBlockStart = index + 1;
      return;
    }

    // Import block end
    if (inImportBlock && trimmedLine === ')') {
      inImportBlock = false;
      return;
    }

    // Import within block
    if (inImportBlock) {
      const blockImportMatch = trimmedLine.match(/^(?:([a-zA-Z_][a-zA-Z0-9_]*)\s+)?"([^"]+)"$/);
      if (blockImportMatch) {
        const alias = blockImportMatch[1];
        const importPath = blockImportMatch[2];
        const packageName = alias || importPath.split('/').pop() || importPath;
        
        imports.push({
          source: importPath,
          specifiers: [{ name: packageName, type: 'default', imported: alias ? importPath : undefined }],
          startLine: importBlockStart
        });
      }
    }
  });

  return imports;
}

function parseGoFunctions(content: string): FunctionInfo[] {
  const functions: FunctionInfo[] = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Match function definitions
    const funcMatch = trimmedLine.match(/^func(?:\s+\([^)]*\))?\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*(?:\(([^)]*)\)|([^{]+))?\s*\{?/);
    if (funcMatch) {
      const funcName = funcMatch[1];
      const paramString = funcMatch[2];
      const returnTypes = funcMatch[3] || funcMatch[4] || '';
      
      // Parse parameters
      const parameters = parseGoParameters(paramString);
      
      // Parse return types
      const returnType = parseGoReturnType(returnTypes.trim());
      
      // Extract comments (Go comments start with // or /* */)
      const comments = extractGoComments(lines, i);
      
      // Find function end
      const endLine = findGoFunctionEnd(lines, i);
      
      functions.push({
        name: funcName,
        parameters,
        returnType,
        isAsync: false, // Go doesn't have async/await like JS
        isGenerator: false,
        comments,
        startLine: i + 1,
        endLine
      });
    }
  }
  
  return functions;
}

function parseGoStructs(content: string): ClassInfo[] {
  const structs: ClassInfo[] = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Match struct definitions
    const structMatch = trimmedLine.match(/^type\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+struct\s*\{?/);
    if (structMatch) {
      const structName = structMatch[1];
      
      const structInfo: ClassInfo = {
        name: structName,
        methods: [],
        properties: [],
        constructor: null,
        superClass: null,
        comments: extractGoComments(lines, i),
        startLine: i + 1,
        endLine: findGoStructEnd(lines, i)
      };

      // Parse struct fields
      const structFields = extractGoStructFields(lines, i);
      structInfo.properties = structFields;

      // Find methods for this struct
      const methods = findGoStructMethods(content, structName);
      structInfo.methods = methods;
      
      structs.push(structInfo);
    }
  }
  
  return structs;
}

function parseGoExports(content: string, functions: FunctionInfo[], structs: ClassInfo[]): ExportInfo[] {
  const exports: ExportInfo[] = [];
  
  // In Go, exported identifiers start with a capital letter
  functions.forEach(func => {
    if (func.name[0] === func.name[0].toUpperCase()) {
      exports.push({
        name: func.name,
        type: 'function',
        startLine: func.startLine
      });
    }
  });

  structs.forEach(struct => {
    if (struct.name[0] === struct.name[0].toUpperCase()) {
      exports.push({
        name: struct.name,
        type: 'struct',
        startLine: struct.startLine
      });
    }
  });

  return exports;
}

function parseGoParameters(paramString: string): Array<{name: string, type: string}> {
  if (!paramString.trim()) return [];
  
  const params = paramString.split(',').map(p => p.trim());
  return params.map(param => {
    // Go parameter format: name type or type (for unnamed parameters)
    const parts = param.trim().split(/\s+/);
    
    if (parts.length >= 2) {
      return {
        name: parts[0],
        type: parts.slice(1).join(' ')
      };
    } else if (parts.length === 1) {
      return {
        name: '_',  // unnamed parameter
        type: parts[0]
      };
    }
    
    return {
      name: 'unknown',
      type: 'interface{}'
    };
  });
}

function parseGoReturnType(returnString: string): string {
  if (!returnString) return 'void';
  
  // Handle multiple return values (common in Go)
  if (returnString.includes(',')) {
    return `(${returnString})`;
  }
  
  return returnString;
}

function extractGoComments(lines: string[], lineIndex: number): string | null {
  const comments: string[] = [];
  
  // Look for comments above the function
  for (let i = lineIndex - 1; i >= 0; i--) {
    const line = lines[i].trim();
    
    if (line.startsWith('//')) {
      comments.unshift(line.substring(2).trim());
    } else if (line.startsWith('/*') && line.endsWith('*/')) {
      comments.unshift(line.substring(2, line.length - 2).trim());
    } else if (line === '') {
      continue; // Skip empty lines
    } else {
      break; // Stop at non-comment, non-empty line
    }
  }
  
  return comments.length > 0 ? comments.join('\n') : null;
}

function findGoFunctionEnd(lines: string[], startIndex: number): number {
  let braceCount = 0;
  let foundOpenBrace = false;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    
    for (const char of line) {
      if (char === '{') {
        braceCount++;
        foundOpenBrace = true;
      } else if (char === '}') {
        braceCount--;
        if (foundOpenBrace && braceCount === 0) {
          return i + 1;
        }
      }
    }
  }
  
  return lines.length;
}

function findGoStructEnd(lines: string[], startIndex: number): number {
  return findGoFunctionEnd(lines, startIndex); // Same brace-counting logic
}

function extractGoStructFields(lines: string[], structStartIndex: number): Array<{name: string, type: string, comments?: string}> {
  const fields: Array<{name: string, type: string, comments?: string}> = [];
  const structEndIndex = findGoStructEnd(lines, structStartIndex);
  
  for (let i = structStartIndex + 1; i < structEndIndex; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith('//') || line.startsWith('/*')) continue;
    
    // Skip the closing brace
    if (line === '}') break;
    
    // Parse field definition
    const fieldMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s+([^\/\s]+)(?:\s*\/\/\s*(.*))?/);
    if (fieldMatch) {
      fields.push({
        name: fieldMatch[1],
        type: fieldMatch[2],
        comments: fieldMatch[3] || undefined
      });
    }
  }
  
  return fields;
}

function findGoStructMethods(content: string, structName: string): FunctionInfo[] {
  const methods: FunctionInfo[] = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Match method definitions (functions with receivers)
    const methodMatch = trimmedLine.match(new RegExp(`^func\\s+\\([^)]*\\*?${structName}[^)]*\\)\\s+([a-zA-Z_][a-zA-Z0-9_]*)\\s*\\(([^)]*)\\)\\s*(?:\\(([^)]*)\\)|([^{]+))?\\s*\\{?`));
    if (methodMatch) {
      const methodName = methodMatch[1];
      const paramString = methodMatch[2];
      const returnTypes = methodMatch[3] || methodMatch[4] || '';
      
      const parameters = parseGoParameters(paramString);
      const returnType = parseGoReturnType(returnTypes.trim());
      const comments = extractGoComments(lines, i);
      const endLine = findGoFunctionEnd(lines, i);
      
      methods.push({
        name: methodName,
        parameters,
        returnType,
        isAsync: false,
        isGenerator: false,
        comments,
        startLine: i + 1,
        endLine
      });
    }
  }
  
  return methods;
}
