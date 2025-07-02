import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import type { ParsedCodeFile, FunctionInfo, ClassInfo, ImportInfo, ExportInfo } from '../../types/index.js';

const execAsync = promisify(exec);

export async function parsePython(content: string, baseResult: ParsedCodeFile): Promise<ParsedCodeFile> {
  try {
    // For Python parsing, we'll use a combination of regex patterns and AST analysis
    // In a production environment, you might want to use a Python subprocess to parse AST
    const result = { ...baseResult };

    // Parse Python imports
    result.imports = parsePythonImports(content);
    
    // Parse Python functions
    result.functions = parsePythonFunctions(content);
    
    // Parse Python classes
    result.classes = parsePythonClasses(content);
    
    // Parse Python exports (typically __all__ or module-level assignments)
    result.exports = parsePythonExports(content);

    return result;

  } catch (error) {
    throw new Error(`Failed to parse Python: ${error.message}`);
  }
}

function parsePythonImports(content: string): ImportInfo[] {
  const imports: ImportInfo[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Parse "import module" statements
    const importMatch = trimmedLine.match(/^import\s+([^\s#]+)(?:\s+as\s+([^\s#]+))?/);
    if (importMatch) {
      const modules = importMatch[1].split(',').map(m => m.trim());
      modules.forEach(module => {
        imports.push({
          source: module,
          specifiers: [{ name: module, type: 'default' }],
          startLine: index + 1
        });
      });
    }

    // Parse "from module import ..." statements
    const fromImportMatch = trimmedLine.match(/^from\s+([^\s]+)\s+import\s+(.+)/);
    if (fromImportMatch) {
      const module = fromImportMatch[1];
      const importList = fromImportMatch[2];
      
      const specifiers = importList.split(',').map(item => {
        const trimmed = item.trim();
        const asMatch = trimmed.match(/^(.+)\s+as\s+(.+)$/);
        if (asMatch) {
          return { name: asMatch[2].trim(), type: 'named' as const, imported: asMatch[1].trim() };
        }
        return { name: trimmed, type: 'named' as const };
      });

      imports.push({
        source: module,
        specifiers,
        startLine: index + 1
      });
    }
  });

  return imports;
}

function parsePythonFunctions(content: string): FunctionInfo[] {
  const functions: FunctionInfo[] = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Match function definitions
    const funcMatch = trimmedLine.match(/^(async\s+)?def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*(?:->\s*([^:]+))?\s*:/);
    if (funcMatch) {
      const isAsync = !!funcMatch[1];
      const funcName = funcMatch[2];
      const paramString = funcMatch[3];
      const returnType = funcMatch[4]?.trim() || 'Any';
      
      // Parse parameters
      const parameters = parseParameters(paramString);
      
      // Extract docstring and comments
      const comments = extractPythonDocstring(lines, i + 1);
      
      // Find function end (simplified)
      const endLine = findFunctionEnd(lines, i);
      
      functions.push({
        name: funcName,
        parameters,
        returnType,
        isAsync,
        isGenerator: false, // Would need more sophisticated parsing
        comments,
        startLine: i + 1,
        endLine
      });
    }
  }
  
  return functions;
}

function parsePythonClasses(content: string): ClassInfo[] {
  const classes: ClassInfo[] = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Match class definitions
    const classMatch = trimmedLine.match(/^class\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\(([^)]*)\))?\s*:/);
    if (classMatch) {
      const className = classMatch[1];
      const superClasses = classMatch[2] ? classMatch[2].split(',').map(s => s.trim()) : [];
      
      const classInfo: ClassInfo = {
        name: className,
        methods: [],
        properties: [],
        constructor: null,
        superClass: superClasses.length > 0 ? superClasses[0] : null,
        comments: extractPythonDocstring(lines, i + 1),
        startLine: i + 1,
        endLine: findClassEnd(lines, i)
      };

      // Parse class methods and properties
      const classContent = extractClassContent(lines, i);
      classInfo.methods = parsePythonMethods(classContent, i + 1);
      
      classes.push(classInfo);
    }
  }
  
  return classes;
}

function parsePythonExports(content: string): ExportInfo[] {
  const exports: ExportInfo[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Parse __all__ exports
    const allMatch = trimmedLine.match(/^__all__\s*=\s*\[([^\]]+)\]/);
    if (allMatch) {
      const exportList = allMatch[1];
      const exportNames = exportList.split(',').map(item => {
        return item.trim().replace(/['"]/g, '');
      });
      
      exportNames.forEach(name => {
        exports.push({
          name,
          type: 'named',
          startLine: index + 1
        });
      });
    }
  });
  
  return exports;
}

function parseParameters(paramString: string): Array<{name: string, type: string, defaultValue?: string}> {
  if (!paramString.trim()) return [];
  
  const params = paramString.split(',').map(p => p.trim());
  return params.map(param => {
    // Handle type annotations and default values
    const defaultMatch = param.match(/^([^=]+)=(.+)$/);
    if (defaultMatch) {
      const paramPart = defaultMatch[1].trim();
      const defaultValue = defaultMatch[2].trim();
      const typeMatch = paramPart.match(/^([^:]+):\s*(.+)$/);
      
      if (typeMatch) {
        return {
          name: typeMatch[1].trim(),
          type: typeMatch[2].trim(),
          defaultValue
        };
      }
      
      return {
        name: paramPart,
        type: 'Any',
        defaultValue
      };
    }
    
    // Handle type annotations without defaults
    const typeMatch = param.match(/^([^:]+):\s*(.+)$/);
    if (typeMatch) {
      return {
        name: typeMatch[1].trim(),
        type: typeMatch[2].trim()
      };
    }
    
    return {
      name: param,
      type: 'Any'
    };
  });
}

function extractPythonDocstring(lines: string[], startIndex: number): string | null {
  if (startIndex >= lines.length) return null;
  
  const line = lines[startIndex].trim();
  
  // Check for triple-quoted docstring
  if (line.startsWith('"""') || line.startsWith("'''")) {
    const quote = line.startsWith('"""') ? '"""' : "'''";
    
    // Single-line docstring
    if (line.endsWith(quote) && line.length > 6) {
      return line.slice(3, -3).trim();
    }
    
    // Multi-line docstring
    let docstring = line.slice(3);
    for (let i = startIndex + 1; i < lines.length; i++) {
      const docLine = lines[i];
      if (docLine.includes(quote)) {
        docstring += '\n' + docLine.substring(0, docLine.indexOf(quote));
        break;
      }
      docstring += '\n' + docLine;
    }
    
    return docstring.trim();
  }
  
  return null;
}

function findFunctionEnd(lines: string[], startIndex: number): number {
  const startIndentation = getIndentation(lines[startIndex]);
  
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue;
    
    const currentIndentation = getIndentation(line);
    if (currentIndentation <= startIndentation) {
      return i;
    }
  }
  
  return lines.length;
}

function findClassEnd(lines: string[], startIndex: number): number {
  return findFunctionEnd(lines, startIndex); // Same logic
}

function extractClassContent(lines: string[], classStartIndex: number): string[] {
  const classEndIndex = findClassEnd(lines, classStartIndex);
  return lines.slice(classStartIndex + 1, classEndIndex);
}

function parsePythonMethods(classLines: string[], baseLineNumber: number): FunctionInfo[] {
  const content = classLines.join('\n');
  const methods = parsePythonFunctions(content);
  
  // Adjust line numbers to be relative to the original file
  return methods.map(method => ({
    ...method,
    startLine: method.startLine + baseLineNumber,
    endLine: method.endLine + baseLineNumber
  }));
}

function getIndentation(line: string): number {
  const match = line.match(/^(\s*)/);
  return match ? match[1].length : 0;
}
