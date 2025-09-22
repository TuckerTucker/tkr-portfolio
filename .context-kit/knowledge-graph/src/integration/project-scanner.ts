import { KnowledgeGraph } from '@tkr-context-kit/core';
import { StaticAnalyzer } from '../analyzers/static-analyzer.js';
import { StorybookAnalyzer } from '../analyzers/storybook-analyzer.js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export interface ProjectScanOptions {
  projectRoot: string;
  patterns?: string[];
  includeTests?: boolean;
  includeStorybook?: boolean;
  storiesPattern?: string;
  configFile?: string;
}

export interface ProjectConfig {
  patterns?: string[];
  ignorePatterns?: string[];
  includeTests?: boolean;
  includeStorybook?: boolean;
  storiesPattern?: string;
  databasePath?: string;
  customEntityTypes?: string[];
  analysisRules?: Record<string, any>;
}

export class ProjectScanner {
  private kg: KnowledgeGraph;
  private staticAnalyzer: StaticAnalyzer;
  private storybookAnalyzer: StorybookAnalyzer;

  constructor(kg: KnowledgeGraph) {
    this.kg = kg;
    this.staticAnalyzer = new StaticAnalyzer(kg);
    this.storybookAnalyzer = new StorybookAnalyzer(kg);
  }

  async scanProject(options: ProjectScanOptions): Promise<void> {
    console.log('🔍 Starting comprehensive project scan...');
    
    // Load project configuration
    const config = this.loadProjectConfig(options);
    
    // Create project entity
    await this.createProjectEntity(options.projectRoot, config);

    // Perform static analysis
    if (config.patterns && config.patterns.length > 0) {
      console.log('📋 Performing static code analysis...');
      await this.staticAnalyzer.analyzeProject({
        projectRoot: options.projectRoot,
        patterns: config.patterns,
        ignorePatterns: config.ignorePatterns,
        includeTests: config.includeTests
      });

      // Analyze module dependencies
      await this.staticAnalyzer.analyzeModuleDependencies({
        projectRoot: options.projectRoot,
        patterns: config.patterns,
        ignorePatterns: config.ignorePatterns,
        includeTests: config.includeTests
      });
    }

    // Perform Storybook analysis
    if (config.includeStorybook) {
      console.log('📚 Analyzing Storybook...');
      await this.storybookAnalyzer.analyzeStorybook({
        projectRoot: options.projectRoot,
        storiesPattern: config.storiesPattern
      });

      await this.storybookAnalyzer.analyzeStorybookDocs({
        projectRoot: options.projectRoot
      });
    }

    // Analyze package.json and project metadata
    await this.analyzeProjectMetadata(options.projectRoot);

    // Extract architectural patterns
    await this.extractArchitecturalPatterns();

    // Generate insights
    await this.generateProjectInsights();

    console.log('✅ Project scan completed successfully');
    await this.printScanSummary();
  }

  private loadProjectConfig(options: ProjectScanOptions): ProjectConfig {
    const defaultConfig: ProjectConfig = {
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      ignorePatterns: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.test.*', '**/*.spec.*'],
      includeTests: false,
      includeStorybook: true,
      storiesPattern: '**/*.stories.{ts,tsx,js,jsx}',
      customEntityTypes: [],
      analysisRules: {}
    };

    // Try to load config file
    if (options.configFile) {
      const configPath = resolve(options.projectRoot, options.configFile);
      if (existsSync(configPath)) {
        try {
          const fileConfig = JSON.parse(readFileSync(configPath, 'utf8'));
          return { ...defaultConfig, ...fileConfig };
        } catch (error) {
          console.warn(`⚠️  Failed to load config file ${configPath}: ${error}`);
        }
      }
    }

    // Look for kg-config.json in project root
    const defaultConfigPath = resolve(options.projectRoot, 'kg-config.json');
    if (existsSync(defaultConfigPath)) {
      try {
        const fileConfig = JSON.parse(readFileSync(defaultConfigPath, 'utf8'));
        return { ...defaultConfig, ...fileConfig };
      } catch (error) {
        console.warn(`⚠️  Failed to load kg-config.json: ${error}`);
      }
    }

    // Override with command line options
    return {
      ...defaultConfig,
      patterns: options.patterns || defaultConfig.patterns,
      includeTests: options.includeTests ?? defaultConfig.includeTests,
      includeStorybook: options.includeStorybook ?? defaultConfig.includeStorybook,
      storiesPattern: options.storiesPattern || defaultConfig.storiesPattern
    };
  }

  private async createProjectEntity(projectRoot: string, config: ProjectConfig): Promise<void> {
    const packageJsonPath = resolve(projectRoot, 'package.json');
    let projectData: any = {
      location: projectRoot,
      scannedAt: new Date().toISOString(),
      config
    };

    // Load package.json if it exists
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        projectData = {
          ...projectData,
          name: packageJson.name,
          version: packageJson.version,
          description: packageJson.description,
          dependencies: Object.keys(packageJson.dependencies || {}),
          devDependencies: Object.keys(packageJson.devDependencies || {}),
          scripts: Object.keys(packageJson.scripts || {})
        };
      } catch {
        console.warn('⚠️  Could not parse package.json');
      }
    }

    await this.kg.createEntity({
      type: 'Project',
      name: projectData.name || 'Unknown Project',
      data: {
        ...projectData,
        observations: [
          `Project root: ${projectRoot}`,
          `Dependencies: ${projectData.dependencies?.length || 0}`,
          `Scripts: ${projectData.scripts?.length || 0}`
        ]
      }
    });
  }

  private async analyzeProjectMetadata(projectRoot: string): Promise<void> {
    console.log('📊 Analyzing project metadata...');

    // Analyze tsconfig.json
    const tsconfigPath = resolve(projectRoot, 'tsconfig.json');
    if (existsSync(tsconfigPath)) {
      try {
        const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));
        await this.kg.createEntity({
          type: 'Configuration',
          name: 'TypeScript',
          data: {
            location: 'tsconfig.json',
            compilerOptions: tsconfig.compilerOptions,
            target: tsconfig.compilerOptions?.target,
            module: tsconfig.compilerOptions?.module,
            strict: tsconfig.compilerOptions?.strict,
            observations: [
              `Target: ${tsconfig.compilerOptions?.target || 'Unknown'}`,
              `Module: ${tsconfig.compilerOptions?.module || 'Unknown'}`,
              `Strict mode: ${tsconfig.compilerOptions?.strict ? 'Enabled' : 'Disabled'}`
            ]
          }
        });
      } catch {
        console.warn('⚠️  Could not parse tsconfig.json');
      }
    }

    // Analyze .eslintrc or eslint.config.js
    const eslintConfigs = ['.eslintrc.json', '.eslintrc.js', 'eslint.config.js'];
    for (const configFile of eslintConfigs) {
      const configPath = resolve(projectRoot, configFile);
      if (existsSync(configPath)) {
        await this.kg.createEntity({
          type: 'Configuration',
          name: 'ESLint',
          data: {
            location: configFile,
            observations: [`ESLint configuration found: ${configFile}`]
          }
        });
        break;
      }
    }

    // Analyze Vite/Webpack configs
    const bundlerConfigs = ['vite.config.ts', 'vite.config.js', 'webpack.config.js'];
    for (const configFile of bundlerConfigs) {
      const configPath = resolve(projectRoot, configFile);
      if (existsSync(configPath)) {
        const bundlerName = configFile.includes('vite') ? 'Vite' : 'Webpack';
        await this.kg.createEntity({
          type: 'Configuration',
          name: bundlerName,
          data: {
            location: configFile,
            observations: [`${bundlerName} configuration found`]
          }
        });
        break;
      }
    }

    // Analyze README.md
    const readmePath = resolve(projectRoot, 'README.md');
    if (existsSync(readmePath)) {
      const content = readFileSync(readmePath, 'utf8');
      await this.kg.createEntity({
        type: 'Documentation',
        name: 'README',
        data: {
          location: 'README.md',
          hasInstallInstructions: content.includes('npm install') || content.includes('yarn install'),
          hasUsageSection: content.includes('## Usage') || content.includes('# Usage'),
          hasBadges: content.includes('![') && content.includes(']('),
          observations: this.extractReadmeObservations(content)
        }
      });
    }
  }

  private extractReadmeObservations(content: string): string[] {
    const observations: string[] = [];
    
    if (content.includes('## Installation')) observations.push('Has installation section');
    if (content.includes('## Usage')) observations.push('Has usage section');
    if (content.includes('## API')) observations.push('Has API documentation');
    if (content.includes('## Contributing')) observations.push('Has contributing guidelines');
    if (content.includes('## License')) observations.push('Has license information');
    
    const codeBlocks = (content.match(/```/g) || []).length / 2;
    if (codeBlocks > 0) observations.push(`Contains ${codeBlocks} code examples`);
    
    return observations;
  }

  private async extractArchitecturalPatterns(): Promise<void> {
    console.log('🏗️  Extracting architectural patterns...');

    // Analyze component patterns
    const components = await this.kg.getEntities({ type: 'Component' });

    if (components.length > 0) {
      const frameworks = new Set(components.map(c => c.data.framework).filter(Boolean));
      for (const framework of frameworks) {
        await this.kg.createEntity({
          type: 'Pattern',
          name: `${framework}Architecture`,
          data: {
            type: 'Architecture',
            framework,
            componentCount: components.filter(c => c.data.framework === framework).length,
            observations: [
              `${framework} architecture pattern`,
              `${components.filter(c => c.data.framework === framework).length} components`
            ]
          }
        });
      }
    }

    // Analyze state management patterns
    const stores = await this.kg.getEntities({ type: 'Store' });

    const stateManagementTech = new Set(stores.map(s => s.data.technology).filter(Boolean));
    for (const tech of stateManagementTech) {
      await this.kg.createEntity({
        type: 'Pattern',
        name: `${tech}StateManagement`,
        data: {
          type: 'StateManagement',
          technology: tech,
          storeCount: stores.filter(s => s.data.technology === tech).length,
          observations: [
            `${tech} state management pattern`,
            `${stores.filter(s => s.data.technology === tech).length} stores`
          ]
        }
      });
    }

    // Analyze API patterns
    const apis = await this.kg.getEntities({ type: 'API' });
    const methodCounts = new Map<string, number>();
    apis.forEach(api => {
      const method = api.data.method;
      if (method) {
        methodCounts.set(method, (methodCounts.get(method) || 0) + 1);
      }
    });

    if (apis.length > 0) {
      const methodsArray = Array.from(methodCounts.entries()).map(([method, count]) => ({ method, count }));
      const totalEndpoints = Array.from(methodCounts.values()).reduce((sum, count) => sum + count, 0);
      await this.kg.createEntity({
        type: 'Pattern',
        name: 'RESTAPIPattern',
        data: {
          type: 'API',
          methods: methodsArray,
          totalEndpoints,
          observations: [
            `REST API pattern detected`,
            `${totalEndpoints} endpoints`,
            `Methods: ${Array.from(methodCounts.keys()).join(', ')}`
          ]
        }
      });
    }
  }

  private async generateProjectInsights(): Promise<void> {
    console.log('💡 Generating project insights...');

    const stats = await this.kg.getStats();
    
    // Complexity insights - get entities and calculate insights
    const components = await this.kg.getEntities({ type: 'Component' });
    const stores = await this.kg.getEntities({ type: 'Store' });
    const actions = await this.kg.getEntities({ type: 'Action' });

    const complexityInsights = [
      {
        type: 'Component',
        count: components.length,
        avg_props: components.reduce((sum, c) => sum + (c.data.props?.length || 0), 0) / Math.max(components.length, 1)
      },
      {
        type: 'Store',
        count: stores.length,
        avg_props: 0 // Stores don't have props in the same way
      },
      {
        type: 'Action',
        count: actions.length,
        avg_props: 0 // Actions don't have props in the same way
      }
    ].filter(insight => insight.count > 0);

    for (const insight of complexityInsights) {
      await this.kg.createEntity({
        type: 'Insight',
        name: `${insight.type}Complexity`,
        data: {
          type: 'Complexity',
          entityType: insight.type,
          count: insight.count,
          averageProps: insight.avg_props || 0,
          complexity: insight.count > 20 ? 'high' : insight.count > 10 ? 'medium' : 'low',
          observations: [
            `${insight.count} ${insight.type.toLowerCase()}s in project`,
            `Complexity: ${insight.count > 20 ? 'High' : insight.count > 10 ? 'Medium' : 'Low'}`,
            insight.avg_props ? `Average props: ${Math.round(insight.avg_props)}` : null
          ].filter(Boolean)
        }
      });
    }

    // Find unused entities (simplified approach - entities with no incoming relations)
    const allEntities = await this.kg.getEntities({ type: 'Component' });
    const allRelations = await this.kg.getRelations();
    const referencedEntityIds = new Set(allRelations.map(r => r.toEntityId));
    const unusedEntities = allEntities.filter(e => !referencedEntityIds.has(e.id));

    if (unusedEntities.length > 0) {
      await this.kg.createEntity({
        type: 'Insight',
        name: 'UnusedEntities',
        data: {
          type: 'CodeHealth',
          count: unusedEntities.length,
          entities: unusedEntities.map(e => e.name),
          severity: unusedEntities.length > 10 ? 'high' : 'medium',
          observations: [
            `${unusedEntities.length} potentially unused entities`,
            `Entities: ${unusedEntities.map(e => e.name).join(', ')}`
          ]
        }
      });
    }

    // Generate test coverage insights
    const allComponents = await this.kg.getEntities({ type: 'Component' });
    const testableComponents = allComponents.length;
    const testRelations = allRelations.filter(r => r.type === 'TESTED_IN');
    const testedComponentIds = new Set(testRelations.map(r => r.toEntityId));
    const testedComponents = allComponents.filter(c => testedComponentIds.has(c.id)).length;

    if (testableComponents > 0) {
      const coverage = (testedComponents / testableComponents) * 100;
      await this.kg.createEntity({
        type: 'Insight',
        name: 'TestCoverage',
        data: {
          type: 'Testing',
          testableComponents,
          testedComponents,
          coveragePercentage: Math.round(coverage),
          severity: coverage < 50 ? 'high' : coverage < 80 ? 'medium' : 'low',
          observations: [
            `${Math.round(coverage)}% of components have tests`,
            `${testedComponents}/${testableComponents} components tested`
          ]
        }
      });
    }
  }

  private async printScanSummary(): Promise<void> {
    const stats = await this.kg.getStats();
    
    console.log('\n📈 Scan Summary:');
    console.log(`  Entities: ${stats.entityCount}`);
    console.log(`  Relations: ${stats.relationCount}`);
    console.log(`  Observations: N/A`);

    // Entity breakdown
    const allEntities = await this.kg.getEntities();
    const entityBreakdown = allEntities.reduce((acc, entity) => {
      acc[entity.type] = (acc[entity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📊 Entity Breakdown:');
    Object.entries(entityBreakdown)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });

    // Top patterns
    const patterns = await this.kg.getEntities({ type: 'Pattern' });
    const topPatterns = patterns.slice(0, 5);

    if (topPatterns.length > 0) {
      console.log('\n🎯 Detected Patterns:');
      topPatterns.forEach(pattern => {
        console.log(`  - ${pattern.name}`);
      });
    }

    // Insights summary
    const insights = await this.kg.getEntities({ type: 'Insight' });

    if (insights.length > 0) {
      console.log('\n💡 Generated Insights:');
      insights.forEach(insight => {
        console.log(`  - ${insight.name} (${insight.data.type})`);
      });
    }
  }

  // Incremental update functionality
  async updateProject(options: ProjectScanOptions, changedFiles?: string[]): Promise<void> {
    if (!changedFiles || changedFiles.length === 0) {
      // Full rescan
      return this.scanProject(options);
    }

    console.log(`🔄 Incremental update for ${changedFiles.length} files...`);

    // Remove entities from changed files
    for (const file of changedFiles) {
      const entities = await this.kg.getEntities();
      const entitiesToRemove = entities.filter(e => e.data.location === file);
      for (const entity of entitiesToRemove) {
        // Note: We'd need a deleteEntity method in the KnowledgeGraph interface
        // For now, this is a placeholder
        console.log(`Would remove entity: ${entity.name}`);
      }
    }

    // Re-analyze changed files
    await this.staticAnalyzer.analyzeProject({
      projectRoot: options.projectRoot,
      patterns: changedFiles,
      includeTests: options.includeTests
    });

    console.log('✅ Incremental update completed');
  }
}