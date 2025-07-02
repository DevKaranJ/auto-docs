import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { ParsedCodeFile, FunctionInfo, ClassInfo } from '../../types/index.js';

export async function parseTypeScript(content: string, baseResult: ParsedCodeFile): Promise<ParsedCodeFile> {
  try {
    const ast = parse(content, {
      sourceType: 'module',
      plugins: [
        'typescript',
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
      // Parse function declarations with TypeScript type annotations
      FunctionDeclaration(path) {
        const node = path.node;
        if (node.id) {
          const func: FunctionInfo = {
            name: node.id.name,
            parameters: node.params.map(param => {
              if (t.isIdentifier(param)) {
                return { 
                  name: param.name, 
                  type: extractTypeAnnotation(param.typeAnnotation) || 'any'
                };
              } else if (t.isAssignmentPattern(param) && t.isIdentifier(param.left)) {
                return { 
                  name: param.left.name, 
                  type: extractTypeAnnotation(param.left.typeAnnotation) || 'any',
                  defaultValue: 'default'
                };
              }
              return { name: 'unknown', type: 'any' };
            }),
            returnType: extractTypeAnnotation(node.returnType) || 'any',
            isAsync: node.async,
            isGenerator: node.generator,
            comments: extractComments(path.node),
            startLine: node.loc?.start.line || 0,
            endLine: node.loc?.end.line || 0
          };
          result.functions.push(func);
        }
      },

      // Parse TypeScript interfaces
      TSInterfaceDeclaration(path) {
        const node = path.node;
        const interfaceInfo: ClassInfo = {
          name: node.id.name,
          methods: [],
          properties: [],
          constructor: null,
          superClass: null,
          isInterface: true,
          comments: extractComments(node),
          startLine: node.loc?.start.line || 0,
          endLine: node.loc?.end.line || 0
        };

        // Parse interface properties and methods
        node.body.body.forEach(member => {
          if (t.isTSPropertySignature(member) && t.isIdentifier(member.key)) {
            interfaceInfo.properties.push({
              name: member.key.name,
              type: extractTypeAnnotation(member.typeAnnotation) || 'any',
              optional: member.optional || false,
              comments: extractComments(member)
            });
          } else if (t.isTSMethodSignature(member) && t.isIdentifier(member.key)) {
            const method: FunctionInfo = {
              name: member.key.name,
              parameters: member.parameters.map(param => {
                if (t.isIdentifier(param)) {
                  return { 
                    name: param.name, 
                    type: extractTypeAnnotation(param.typeAnnotation) || 'any'
                  };
                }
                return { name: 'unknown', type: 'any' };
              }),
              returnType: extractTypeAnnotation(member.typeAnnotation) || 'any',
              isAsync: false,
              isGenerator: false,
              optional: member.optional || false,
              comments: extractComments(member),
              startLine: member.loc?.start.line || 0,
              endLine: member.loc?.end.line || 0
            };
            interfaceInfo.methods.push(method);
          }
        });

        result.classes.push(interfaceInfo);
      },

      // Parse TypeScript type aliases
      TSTypeAliasDeclaration(path) {
        const node = path.node;
        result.exports.push({
          name: node.id.name,
          type: 'type',
          typeDefinition: extractTypeAnnotation(node.typeAnnotation),
          startLine: node.loc?.start.line || 0
        });
      },

      // Continue with regular JavaScript parsing for other constructs
      VariableDeclarator(path) {
        if (t.isIdentifier(path.node.id) && 
            (t.isArrowFunctionExpression(path.node.init) || 
             t.isFunctionExpression(path.node.init))) {
          const init = path.node.init;
          const func: FunctionInfo = {
            name: path.node.id.name,
            parameters: init.params.map(param => {
              if (t.isIdentifier(param)) {
                return { 
                  name: param.name, 
                  type: extractTypeAnnotation(param.typeAnnotation) || 'any'
                };
              }
              return { name: 'unknown', type: 'any' };
            }),
            returnType: extractTypeAnnotation(init.returnType) || 'any',
            isAsync: init.async,
            isGenerator: t.isFunctionExpression(init) ? init.generator : false,
            comments: extractComments(path.node),
            startLine: path.node.loc?.start.line || 0,
            endLine: path.node.loc?.end.line || 0
          };
          result.functions.push(func);
        }
      },

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

          // Parse class members with TypeScript annotations
          node.body.body.forEach(member => {
            if (t.isMethodDefinition(member) && t.isIdentifier(member.key)) {
              const method: FunctionInfo = {
                name: member.key.name,
                parameters: member.value.params.map(param => {
                  if (t.isIdentifier(param)) {
                    return { 
                      name: param.name, 
                      type: extractTypeAnnotation(param.typeAnnotation) || 'any'
                    };
                  }
                  return { name: 'unknown', type: 'any' };
                }),
                returnType: extractTypeAnnotation(member.value.returnType) || 'any',
                isAsync: member.value.async,
                isGenerator: member.value.generator,
                isStatic: member.static,
                visibility: extractVisibility(member),
                comments: extractComments(member),
                startLine: member.loc?.start.line || 0,
                endLine: member.loc?.end.line || 0
              };

              if (member.kind === 'constructor') {
                classInfo.constructor = method;
              } else {
                classInfo.methods.push(method);
              }
            } else if (t.isClassProperty(member) && t.isIdentifier(member.key)) {
              classInfo.properties.push({
                name: member.key.name,
                type: extractTypeAnnotation(member.typeAnnotation) || 'any',
                isStatic: member.static,
                visibility: extractVisibility(member),
                comments: extractComments(member)
              });
            }
          });

          result.classes.push(classInfo);
        }
      }
    });

    return result;

  } catch (error) {
    throw new Error(`Failed to parse TypeScript: ${error.message}`);
  }
}

function extractTypeAnnotation(typeAnnotation: any): string | null {
  if (!typeAnnotation) return null;
  
  // This is a simplified type extraction - in production, you'd want more comprehensive type handling
  if (t.isTSTypeAnnotation(typeAnnotation)) {
    const tsType = typeAnnotation.typeAnnotation;
    
    if (t.isTSStringKeyword(tsType)) return 'string';
    if (t.isTSNumberKeyword(tsType)) return 'number';
    if (t.isTSBooleanKeyword(tsType)) return 'boolean';
    if (t.isTSVoidKeyword(tsType)) return 'void';
    if (t.isTSAnyKeyword(tsType)) return 'any';
    if (t.isTSUnknownKeyword(tsType)) return 'unknown';
    if (t.isTSNeverKeyword(tsType)) return 'never';
    if (t.isTSTypeReference(tsType) && t.isIdentifier(tsType.typeName)) {
      return tsType.typeName.name;
    }
    if (t.isTSArrayType(tsType)) {
      const elementType = extractTypeFromTSType(tsType.elementType);
      return `${elementType}[]`;
    }
  }
  
  return null;
}

function extractTypeFromTSType(tsType: any): string {
  if (t.isTSStringKeyword(tsType)) return 'string';
  if (t.isTSNumberKeyword(tsType)) return 'number';
  if (t.isTSBooleanKeyword(tsType)) return 'boolean';
  if (t.isTSTypeReference(tsType) && t.isIdentifier(tsType.typeName)) {
    return tsType.typeName.name;
  }
  return 'any';
}

function extractVisibility(member: any): 'public' | 'private' | 'protected' | undefined {
  if (member.accessibility) {
    return member.accessibility;
  }
  return undefined;
}

function extractComments(node: any): string | null {
  if (node.leadingComments && node.leadingComments.length > 0) {
    return node.leadingComments
      .map((comment: any) => comment.value.trim())
      .join('\n');
  }
  return null;
}
