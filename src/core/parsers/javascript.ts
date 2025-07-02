import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { ParsedCodeFile, FunctionInfo, ClassInfo, ImportInfo, ExportInfo } from '../../types/index.js';

export async function parseJavaScript(content: string, baseResult: ParsedCodeFile): Promise<ParsedCodeFile> {
  try {
    const ast = parse(content, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'asyncGenerators',
        'bigInt',
        'classProperties',
        'decorators-legacy',
        'doExpressions',
        'dynamicImport',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'functionBind',
        'functionSent',
        'importMeta',
        'nullishCoalescingOperator',
        'numericSeparator',
        'objectRestSpread',
        'optionalCatchBinding',
        'optionalChaining',
        'throwExpressions',
        'topLevelAwait',
        'trailingFunctionCommas'
      ]
    });

    const result = { ...baseResult };

    traverse(ast, {
      // Parse function declarations
      FunctionDeclaration(path) {
        const node = path.node;
        if (node.id) {
          const func: FunctionInfo = {
            name: node.id.name,
            parameters: node.params.map(param => {
              if (t.isIdentifier(param)) {
                return { name: param.name, type: 'any' };
              } else if (t.isAssignmentPattern(param) && t.isIdentifier(param.left)) {
                return { name: param.left.name, type: 'any', defaultValue: 'default' };
              }
              return { name: 'unknown', type: 'any' };
            }),
            returnType: 'any',
            isAsync: node.async,
            isGenerator: node.generator,
            comments: extractComments(path.node),
            startLine: node.loc?.start.line || 0,
            endLine: node.loc?.end.line || 0
          };
          result.functions.push(func);
        }
      },

      // Parse arrow functions assigned to variables
      VariableDeclarator(path) {
        if (t.isIdentifier(path.node.id) && 
            (t.isArrowFunctionExpression(path.node.init) || 
             t.isFunctionExpression(path.node.init))) {
          const func: FunctionInfo = {
            name: path.node.id.name,
            parameters: path.node.init.params.map(param => {
              if (t.isIdentifier(param)) {
                return { name: param.name, type: 'any' };
              }
              return { name: 'unknown', type: 'any' };
            }),
            returnType: 'any',
            isAsync: path.node.init.async,
            isGenerator: t.isFunctionExpression(path.node.init) ? path.node.init.generator : false,
            comments: extractComments(path.node),
            startLine: path.node.loc?.start.line || 0,
            endLine: path.node.loc?.end.line || 0
          };
          result.functions.push(func);
        }
      },

      // Parse class declarations
      ClassDeclaration(path) {
        const node = path.node;
        if (node.id) {
          const classInfo: ClassInfo = {
            name: node.id.name,
            methods: [],
            properties: [],
            constructor: null,
            superClass: node.superClass && t.isIdentifier(node.superClass) ? node.superClass.name : null,
            comments: extractComments(node),
            startLine: node.loc?.start.line || 0,
            endLine: node.loc?.end.line || 0
          };

          // Parse class methods and properties
          node.body.body.forEach(member => {
            if (t.isMethodDefinition(member) && t.isIdentifier(member.key)) {
              const method: FunctionInfo = {
                name: member.key.name,
                parameters: member.value.params.map(param => {
                  if (t.isIdentifier(param)) {
                    return { name: param.name, type: 'any' };
                  }
                  return { name: 'unknown', type: 'any' };
                }),
                returnType: 'any',
                isAsync: member.value.async,
                isGenerator: member.value.generator,
                isStatic: member.static,
                comments: extractComments(member),
                startLine: member.loc?.start.line || 0,
                endLine: member.loc?.end.line || 0
              };

              if (member.kind === 'constructor') {
                classInfo.constructor = method;
              } else {
                classInfo.methods.push(method);
              }
            }
          });

          result.classes.push(classInfo);
        }
      },

      // Parse imports
      ImportDeclaration(path) {
        const node = path.node;
        const importInfo: ImportInfo = {
          source: node.source.value,
          specifiers: node.specifiers.map(spec => {
            if (t.isImportDefaultSpecifier(spec)) {
              return { name: spec.local.name, type: 'default' };
            } else if (t.isImportSpecifier(spec)) {
              return { 
                name: spec.local.name, 
                type: 'named',
                imported: t.isIdentifier(spec.imported) ? spec.imported.name : spec.local.name
              };
            } else if (t.isImportNamespaceSpecifier(spec)) {
              return { name: spec.local.name, type: 'namespace' };
            }
            return { name: 'unknown', type: 'named' };
          }),
          startLine: node.loc?.start.line || 0
        };
        result.imports.push(importInfo);
      },

      // Parse exports
      ExportNamedDeclaration(path) {
        const node = path.node;
        if (node.declaration) {
          if (t.isFunctionDeclaration(node.declaration) && node.declaration.id) {
            result.exports.push({
              name: node.declaration.id.name,
              type: 'function',
              startLine: node.loc?.start.line || 0
            });
          } else if (t.isVariableDeclaration(node.declaration)) {
            node.declaration.declarations.forEach(decl => {
              if (t.isIdentifier(decl.id)) {
                result.exports.push({
                  name: decl.id.name,
                  type: 'variable',
                  startLine: node.loc?.start.line || 0
                });
              }
            });
          }
        } else if (node.specifiers) {
          node.specifiers.forEach(spec => {
            if (t.isExportSpecifier(spec)) {
              result.exports.push({
                name: t.isIdentifier(spec.exported) ? spec.exported.name : 'unknown',
                type: 'named',
                startLine: node.loc?.start.line || 0
              });
            }
          });
        }
      },

      ExportDefaultDeclaration(path) {
        const node = path.node;
        let exportName = 'default';
        
        if (t.isFunctionDeclaration(node.declaration) && node.declaration.id) {
          exportName = node.declaration.id.name;
        } else if (t.isClassDeclaration(node.declaration) && node.declaration.id) {
          exportName = node.declaration.id.name;
        }

        result.exports.push({
          name: exportName,
          type: 'default',
          startLine: node.loc?.start.line || 0
        });
      }
    });

    return result;

  } catch (error) {
    throw new Error(`Failed to parse JavaScript: ${error.message}`);
  }
}

function extractComments(node: any): string | null {
  if (node.leadingComments && node.leadingComments.length > 0) {
    return node.leadingComments
      .map((comment: any) => comment.value.trim())
      .join('\n');
  }
  return null;
}
