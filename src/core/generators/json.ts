import path from 'path';
import fs from 'fs/promises';
import { getOutputFileName, createIndexFile } from './index.js';
import type { DocumentationResult, GenerationOptions } from '../../types/index.js';

export async function generateJSON(
  results: DocumentationResult[],
  options: GenerationOptions
): Promise<void> {
  // Generate individual JSON files for each source file
  for (const result of results) {
    const outputFile = getOutputFileName(result.file, 'json', options.outputPath);
    const jsonContent = generateJSONForFile(result);
    
    await fs.writeFile(outputFile, jsonContent, 'utf-8');
  }

  // Create an index file
  await createIndexFile(results, options);

  // Create a combined JSON file with all documentation
  await generateCombinedJSON(results, options);
}

function generateJSONForFile(result: DocumentationResult): string {
  const { file, parsedCode, documentation } = result;
  
  const jsonData = {
    meta: {
      file: path.relative(process.cwd(), file),
      fileName: path.basename(file),
      language: parsedCode.language,
      generatedAt: new Date().toISOString(),
      generatedBy: 'Auto-Docs CLI'
    },
    documentation: {
      title: documentation.title || path.basename(file),
      description: documentation.description || null,
      functions: documentation.functions?.map(formatFunctionForJSON) || [],
      classes: documentation.classes?.map(formatClassForJSON) || [],
      exports: documentation.exports?.map(formatExportForJSON) || [],
      usage: documentation.usage || null,
      notes: documentation.notes || null
    },
    sourceInfo: {
      totalLines: parsedCode.content.split('\n').length,
      functionsCount: parsedCode.functions.length,
      classesCount: parsedCode.classes.length,
      importsCount: parsedCode.imports.length,
      exportsCount: parsedCode.exports.length
    },
    parsing: {
      imports: parsedCode.imports.map(formatImportForJSON),
      rawFunctions: parsedCode.functions.map(formatRawFunctionForJSON),
      rawClasses: parsedCode.classes.map(formatRawClassForJSON),
      rawExports: parsedCode.exports.map(formatRawExportForJSON)
    }
  };

  return JSON.stringify(jsonData, null, 2);
}

async function generateCombinedJSON(
  results: DocumentationResult[],
  options: GenerationOptions
): Promise<void> {
  const combinedPath = path.join(options.outputPath, 'combined-documentation.json');
  
  const combinedData = {
    meta: {
      projectName: path.basename(process.cwd()),
      generatedAt: new Date().toISOString(),
      generatedBy: 'Auto-Docs CLI',
      totalFiles: results.length,
      outputFormat: 'json',
      style: options.style
    },
    summary: {
      totalFunctions: results.reduce((sum, result) => sum + (result.documentation.functions?.length || 0), 0),
      totalClasses: results.reduce((sum, result) => sum + (result.documentation.classes?.length || 0), 0),
      totalExports: results.reduce((sum, result) => sum + (result.documentation.exports?.length || 0), 0),
      languages: [...new Set(results.map(result => result.parsedCode.language))]
    },
    files: results.map(result => ({
      file: path.relative(process.cwd(), result.file),
      language: result.parsedCode.language,
      title: result.documentation.title || path.basename(result.file),
      description: result.documentation.description,
      functionsCount: result.documentation.functions?.length || 0,
      classesCount: result.documentation.classes?.length || 0,
      exportsCount: result.documentation.exports?.length || 0,
      sourceLines: result.parsedCode.content.split('\n').length
    })),
    documentation: results.reduce((acc, result) => {
      const fileName = path.basename(result.file, path.extname(result.file));
      acc[fileName] = {
        file: path.relative(process.cwd(), result.file),
        language: result.parsedCode.language,
        documentation: result.documentation
      };
      return acc;
    }, {} as Record<string, any>)
  };

  await fs.writeFile(combinedPath, JSON.stringify(combinedData, null, 2), 'utf-8');
}

function formatFunctionForJSON(func: any) {
  return {
    name: func.name,
    description: func.description || null,
    signature: {
      parameters: func.parameters?.map((p: any) => ({
        name: p.name,
        type: p.type,
        description: p.description || null,
        defaultValue: p.defaultValue || null,
        required: !p.defaultValue
      })) || [],
      returnType: func.returns?.type || 'void',
      returnDescription: func.returns?.description || null
    },
    attributes: {
      isAsync: func.isAsync || false,
      isGenerator: func.isGenerator || false,
      isStatic: func.isStatic || false,
      visibility: func.visibility || 'public'
    },
    example: func.example || null,
    sourceLocation: {
      startLine: func.startLine || null,
      endLine: func.endLine || null
    }
  };
}

function formatClassForJSON(cls: any) {
  return {
    name: cls.name,
    description: cls.description || null,
    inheritance: {
      superClass: cls.superClass || null,
      isInterface: cls.isInterface || false
    },
    properties: cls.properties?.map((prop: any) => ({
      name: prop.name,
      type: prop.type,
      description: prop.description || null,
      attributes: {
        isStatic: prop.isStatic || false,
        visibility: prop.visibility || 'public',
        optional: prop.optional || false
      }
    })) || [],
    methods: cls.methods?.map(formatFunctionForJSON) || [],
    constructor: cls.constructor ? formatFunctionForJSON(cls.constructor) : null,
    sourceLocation: {
      startLine: cls.startLine || null,
      endLine: cls.endLine || null
    }
  };
}

function formatExportForJSON(exp: any) {
  return {
    name: exp.name,
    type: exp.type,
    description: exp.description || null,
    typeDefinition: exp.typeDefinition || null,
    sourceLocation: {
      startLine: exp.startLine || null
    }
  };
}

function formatImportForJSON(imp: any) {
  return {
    source: imp.source,
    specifiers: imp.specifiers?.map((spec: any) => ({
      name: spec.name,
      type: spec.type,
      imported: spec.imported || null
    })) || [],
    sourceLocation: {
      startLine: imp.startLine || null
    }
  };
}

function formatRawFunctionForJSON(func: any) {
  return {
    name: func.name,
    parameters: func.parameters || [],
    returnType: func.returnType || 'any',
    isAsync: func.isAsync || false,
    isGenerator: func.isGenerator || false,
    isStatic: func.isStatic || false,
    visibility: func.visibility || null,
    comments: func.comments || null,
    sourceLocation: {
      startLine: func.startLine || null,
      endLine: func.endLine || null
    }
  };
}

function formatRawClassForJSON(cls: any) {
  return {
    name: cls.name,
    superClass: cls.superClass || null,
    isInterface: cls.isInterface || false,
    properties: cls.properties || [],
    methods: cls.methods?.map(formatRawFunctionForJSON) || [],
    constructor: cls.constructor ? formatRawFunctionForJSON(cls.constructor) : null,
    comments: cls.comments || null,
    sourceLocation: {
      startLine: cls.startLine || null,
      endLine: cls.endLine || null
    }
  };
}

function formatRawExportForJSON(exp: any) {
  return {
    name: exp.name,
    type: exp.type,
    typeDefinition: exp.typeDefinition || null,
    sourceLocation: {
      startLine: exp.startLine || null
    }
  };
}
