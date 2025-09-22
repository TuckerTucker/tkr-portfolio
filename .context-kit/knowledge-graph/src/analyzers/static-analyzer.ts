import * as ts from 'typescript';
import { readFileSync } from 'fs';
import { glob } from 'glob';
import { basename, dirname, relative } from 'path';
import { KnowledgeGraph, type Entity } from '@tkr-context-kit/core';

export interface AnalysisOptions {
  projectRoot: string;
  patterns: string[];
  ignorePatterns?: string[];
  includeTests?: boolean;
}

export interface ComponentInfo {
  name: string;
  filePath: string;
  props?: Array<{
    name: string;
    type: string;
    optional: boolean;
  }>;
  hooks?: string[];
  dependencies?: string[];
  exports?: string[];
}

export class StaticAnalyzer {
  private kg: KnowledgeGraph;
  private program: ts.Program | null = null;
  private checker: ts.TypeChecker | null = null;

  constructor(kg: KnowledgeGraph) {
    this.kg = kg;
  }

  async analyzeProject(options: AnalysisOptions): Promise<void> {
    console.log('🔍 Starting static code analysis...');
    
    // Find all files matching patterns
    const files = await this.findFiles(options);
    console.log(`Found ${files.length} files to analyze`);

    // Create TypeScript program
    this.createProgram(files);

    // Analyze each file
    for (const file of files) {
      await this.analyzeFile(file, options.projectRoot);
    }

    console.log('✅ Static analysis complete');
  }

  private async findFiles(options: AnalysisOptions): Promise<string[]> {
    const allFiles: string[] = [];
    
    for (const pattern of options.patterns) {
      const files = await glob(pattern, {
        cwd: options.projectRoot,
        absolute: true,
        ignore: options.ignorePatterns || ['**/node_modules/**', '**/dist/**', '**/build/**']
      });
      allFiles.push(...files);
    }

    // Filter out test files unless explicitly included
    if (!options.includeTests) {
      return allFiles.filter(f => !f.includes('.test.') && !f.includes('.spec.'));
    }

    return [...new Set(allFiles)]; // Remove duplicates
  }

  private createProgram(files: string[]): void {
    const options: ts.CompilerOptions = {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
      allowJs: true,
      checkJs: false,
      skipLibCheck: true,
      moduleResolution: ts.ModuleResolutionKind.NodeNext
    };

    this.program = ts.createProgram(files, options);
    this.checker = this.program.getTypeChecker();
  }

  private async analyzeFile(filePath: string, projectRoot: string): Promise<void> {
    if (!this.program) return;

    const sourceFile = this.program.getSourceFile(filePath);
    if (!sourceFile) return;

    const relativePath = relative(projectRoot, filePath);
    console.log(`  Analyzing: ${relativePath}`);

    // Visit all nodes in the file
    for (const node of sourceFile.getChildren()) {
      await this.visitNode(node, relativePath);
    }
  }

  private async visitNode(node: ts.Node, filePath: string): Promise<void> {
    // Analyze React components
    if (this.isReactComponent(node)) {
      await this.analyzeComponent(node, filePath);
    }

    // Analyze state stores (Zustand, Redux, etc.)
    if (this.isStateStore(node)) {
      await this.analyzeStore(node, filePath);
    }

    // Analyze actions/mutations
    if (this.isAction(node)) {
      await this.analyzeAction(node, filePath);
    }

    // Analyze API endpoints
    if (this.isAPIEndpoint(node)) {
      await this.analyzeAPI(node, filePath);
    }

    // Recurse into child nodes
    for (const child of node.getChildren()) {
      await this.visitNode(child, filePath);
    }
  }

  private isReactComponent(node: ts.Node): boolean {
    if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      // Check if it returns JSX
      const body = (node as any).body;
      if (body && this.containsJSX(body)) {
        return true;
      }
    }

    // Check for class components
    if (ts.isClassDeclaration(node)) {
      const heritage = (node as ts.ClassDeclaration).heritageClauses;
      if (heritage) {
        return heritage.some(clause => 
          clause.types.some(type => 
            type.expression.getText().includes('Component') ||
            type.expression.getText().includes('PureComponent')
          )
        );
      }
    }

    return false;
  }

  private containsJSX(node: ts.Node): boolean {
    let hasJSX = false;
    
    const visit = (n: ts.Node) => {
      if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n)) {
        hasJSX = true;
      }
      if (!hasJSX) {
        ts.forEachChild(n, visit);
      }
    };
    
    visit(node);
    return hasJSX;
  }

  private async analyzeComponent(node: ts.Node, filePath: string): Promise<void> {
    let componentName = 'Anonymous';
    let props: string[] = [];

    // Get component name
    if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) {
      componentName = node.name?.getText() || 'Anonymous';
    } else if (ts.isVariableStatement(node)) {
      const declaration = node.declarationList.declarations[0];
      if (declaration.name) {
        componentName = declaration.name.getText();
      }
    }

    // Extract props
    if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      const params = (node as any).parameters;
      if (params && params.length > 0) {
        const propsParam = params[0];
        if (propsParam.type && ts.isTypeLiteralNode(propsParam.type)) {
          props = propsParam.type.members
            .filter((m: any) => ts.isPropertySignature(m))
            .map((m: any) => m.name?.getText() || '');
        }
      }
    }

    // Extract dependencies (hooks, stores, etc.)
    const dependencies = this.extractDependencies(node);

    // Create component entity
    const component = await this.kg.createEntity({
      type: 'Component',
      name: componentName,
      data: {
        location: filePath,
        framework: 'React',
        props,
        hooks: dependencies.hooks,
        observations: [
          `Located in ${filePath}`,
          props.length > 0 ? `Props: ${props.join(', ')}` : 'No props',
          dependencies.hooks.length > 0 ? `Uses hooks: ${dependencies.hooks.join(', ')}` : null
        ].filter(Boolean)
      }
    });

    // Create relations to stores
    for (const storeName of dependencies.stores) {
      const stores = await this.kg.getEntities({ type: 'Store', name: storeName });
      const store = stores[0];
      if (store) {
        await this.kg.createRelation({
          from_id: component.id,
          to_id: store.id,
          type: 'USES'
        });
      }
    }
  }

  private isStateStore(node: ts.Node): boolean {
    // Zustand pattern
    if (ts.isCallExpression(node)) {
      const expression = node.expression.getText();
      if (expression.includes('create') && 
          (expression.includes('zustand') || expression.includes('Store'))) {
        return true;
      }
    }

    // Redux pattern
    if (ts.isVariableStatement(node)) {
      const text = node.getText();
      if (text.includes('createSlice') || text.includes('createStore')) {
        return true;
      }
    }

    return false;
  }

  private async analyzeStore(node: ts.Node, filePath: string): Promise<void> {
    let storeName = 'UnknownStore';
    let stateShape: Record<string, any> = {};
    let actions: string[] = [];

    // Extract store name
    if (ts.isVariableStatement(node)) {
      const declaration = node.declarationList.declarations[0];
      storeName = declaration.name?.getText() || 'UnknownStore';
    }

    // Extract state shape and actions from Zustand store
    if (ts.isCallExpression(node) && node.arguments.length > 0) {
      const storeConfig = node.arguments[0];
      if (ts.isArrowFunction(storeConfig) || ts.isFunctionExpression(storeConfig)) {
        const body = storeConfig.body;
        if (ts.isObjectLiteralExpression(body)) {
          body.properties.forEach(prop => {
            if (ts.isPropertyAssignment(prop) || ts.isMethodDeclaration(prop)) {
              const name = prop.name?.getText() || '';
              if (ts.isMethodDeclaration(prop) || 
                  (ts.isPropertyAssignment(prop) && ts.isArrowFunction(prop.initializer))) {
                actions.push(name);
              } else {
                stateShape[name] = 'unknown';
              }
            }
          });
        }
      }
    }

    // Create store entity
    const store = await this.kg.createEntity({
      type: 'Store',
      name: storeName,
      data: {
        location: filePath,
        technology: 'Zustand', // Could be detected more accurately
        stateShape: Object.keys(stateShape),
        actions,
        observations: [
          `Located in ${filePath}`,
          `State properties: ${Object.keys(stateShape).join(', ')}`,
          `Actions: ${actions.join(', ')}`
        ]
      }
    });

    // Create action entities and relations
    for (const actionName of actions) {
      const action = await this.kg.createEntity({
        type: 'Action',
        name: `${storeName}.${actionName}`,
        data: {
          location: `${storeName}.${actionName}()`,
          store: storeName
        }
      });

      await this.kg.createRelation({
        from_id: action.id,
        to_id: store.id,
        type: 'MUTATES'
      });
    }
  }

  private isAction(node: ts.Node): boolean {
    // Look for functions that mutate state
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
      const body = node.body?.getText() || '';
      return body.includes('setState') || 
             body.includes('dispatch') || 
             body.includes('set(') ||
             body.includes('update(');
    }
    return false;
  }

  private async analyzeAction(node: ts.Node, filePath: string): Promise<void> {
    if (!ts.isFunctionDeclaration(node) && !ts.isMethodDeclaration(node)) return;

    const actionName = node.name?.getText() || 'UnknownAction';
    const parameters = node.parameters.map(p => p.name?.getText() || '');

    // Extract what the action does by analyzing its body
    const body = node.body?.getText() || '';
    const mutations: string[] = [];

    // Simple pattern matching for state mutations
    const setStateMatches: string[] = body.match(/set(?:State)?\s*\(\s*[{(]([^})]*)[})]/g) || [];
    setStateMatches.forEach(matchStr => {
      const props: string[] = matchStr.match(/(\w+):/g) || [];
      mutations.push(...props.map(p => p.replace(':', '')));
    });

    const action = await this.kg.createEntity({
      type: 'Action',
      name: actionName,
      data: {
        location: filePath,
        parameters,
        mutations,
        observations: [
          `Located in ${filePath}`,
          parameters.length > 0 ? `Parameters: ${parameters.join(', ')}` : 'No parameters',
          mutations.length > 0 ? `Mutates: ${mutations.join(', ')}` : 'No direct mutations detected'
        ]
      }
    });
  }

  private isAPIEndpoint(node: ts.Node): boolean {
    if (ts.isCallExpression(node)) {
      const expression = node.expression.getText();
      return expression.includes('fetch') || 
             expression.includes('axios') || 
             expression.includes('api.') ||
             expression.includes('.get(') ||
             expression.includes('.post(') ||
             expression.includes('.put(') ||
             expression.includes('.delete(');
    }
    return false;
  }

  private async analyzeAPI(node: ts.Node, filePath: string): Promise<void> {
    if (!ts.isCallExpression(node)) return;

    const expression = node.expression.getText();
    let method = 'GET';
    let endpoint = 'unknown';

    // Extract HTTP method
    if (expression.includes('.post')) method = 'POST';
    else if (expression.includes('.put')) method = 'PUT';
    else if (expression.includes('.delete')) method = 'DELETE';
    else if (expression.includes('.patch')) method = 'PATCH';

    // Try to extract endpoint
    if (node.arguments.length > 0) {
      const firstArg = node.arguments[0];
      if (ts.isStringLiteral(firstArg)) {
        endpoint = firstArg.text;
      }
    }

    const apiName = `${method} ${endpoint}`;
    
    await this.kg.createEntity({
      type: 'API',
      name: apiName,
      data: {
        location: filePath,
        method,
        endpoint,
        observations: [
          `Located in ${filePath}`,
          `HTTP ${method} ${endpoint}`
        ]
      }
    });
  }

  private extractDependencies(node: ts.Node): { hooks: string[], stores: string[] } {
    const hooks: string[] = [];
    const stores: string[] = [];

    const visit = (n: ts.Node) => {
      if (ts.isCallExpression(n)) {
        const expression = n.expression.getText();
        
        // React hooks
        if (expression.startsWith('use')) {
          hooks.push(expression);
        }
        
        // Store usage patterns
        if (expression.includes('Store') && !expression.includes('create')) {
          const storeName = expression.replace(/\(.*\)/, '').trim();
          stores.push(storeName);
        }
      }
      
      ts.forEachChild(n, visit);
    };

    visit(node);
    
    return { 
      hooks: [...new Set(hooks)], 
      stores: [...new Set(stores)] 
    };
  }

  // Analyze import/export relationships
  async analyzeModuleDependencies(options: AnalysisOptions): Promise<void> {
    if (!this.program) return;

    console.log('🔗 Analyzing module dependencies...');

    for (const sourceFile of this.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      
      const filePath = relative(options.projectRoot, sourceFile.fileName);
      
      // Skip node_modules
      if (filePath.includes('node_modules')) continue;

      // Analyze imports
      for (const statement of sourceFile.statements) {
        if (ts.isImportDeclaration(statement)) {
          const moduleSpecifier = statement.moduleSpecifier;
          if (ts.isStringLiteral(moduleSpecifier)) {
            const importPath = moduleSpecifier.text;

            // Only track relative imports (project internal)
            if (importPath.startsWith('.')) {
              await this.createImportRelation(filePath, importPath);
            }
          }
        }
      }
    }
  }

  private async createImportRelation(fromFile: string, importPath: string): Promise<void> {
    // This is simplified - in reality would need to resolve the actual file
    const fromEntities = await this.kg.getEntities({ type: 'Module', name: fromFile });
    const fromEntity = fromEntities[0];
    const toFile = this.resolveImportPath(fromFile, importPath);
    const toEntities = await this.kg.getEntities({ type: 'Module', name: toFile });
    const toEntity = toEntities[0];

    if (fromEntity && toEntity) {
      await this.kg.createRelation({
        from_id: fromEntity.id,
        to_id: toEntity.id,
        type: 'IMPORTS'
      });
    }
  }

  private resolveImportPath(fromFile: string, importPath: string): string {
    // Simplified import resolution
    const dir = dirname(fromFile);
    return `${dir}/${importPath}`.replace(/\/\//g, '/');
  }
}