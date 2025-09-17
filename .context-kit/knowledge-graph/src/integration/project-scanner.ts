import { AppStateKGSimple } from '../core/knowledge-graph-simple.js';
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
  private kg: AppStateKGSimple;
  private staticAnalyzer: StaticAnalyzer;
  private storybookAnalyzer: StorybookAnalyzer;

  constructor(kg: AppStateKGSimple) {
    this.kg = kg;
    this.staticAnalyzer = new StaticAnalyzer(kg);
    this.storybookAnalyzer = new StorybookAnalyzer(kg);
  }

  async scanProject(options: ProjectScanOptions): Promise<void> {
    console.log('🔍 Starting comprehensive project scan...');
    
    // Load project configuration
    const config = this.loadProjectConfig(options);
    
    // Create project entity
    this.createProjectEntity(options.projectRoot, config);

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
    this.printScanSummary();
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

  private createProjectEntity(projectRoot: string, config: ProjectConfig): void {
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

    this.kg.createEntity('Project', projectData.name || 'Unknown Project', {
      ...projectData,
      observations: [
        `Project root: ${projectRoot}`,
        `Dependencies: ${projectData.dependencies?.length || 0}`,
        `Scripts: ${projectData.scripts?.length || 0}`
      ]
    });
  }

  private async analyzeProjectMetadata(projectRoot: string): Promise<void> {
    console.log('📊 Analyzing project metadata...');

    // Analyze tsconfig.json
    const tsconfigPath = resolve(projectRoot, 'tsconfig.json');
    if (existsSync(tsconfigPath)) {
      try {
        const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));
        this.kg.createEntity('Configuration', 'TypeScript', {
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
        this.kg.createEntity('Configuration', 'ESLint', {
          location: configFile,
          observations: [`ESLint configuration found: ${configFile}`]
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
        this.kg.createEntity('Configuration', bundlerName, {
          location: configFile,
          observations: [`${bundlerName} configuration found`]
        });
        break;
      }
    }

    // Analyze README.md
    const readmePath = resolve(projectRoot, 'README.md');
    if (existsSync(readmePath)) {
      const content = readFileSync(readmePath, 'utf8');
      this.kg.createEntity('Documentation', 'README', {
        location: 'README.md',
        hasInstallInstructions: content.includes('npm install') || content.includes('yarn install'),
        hasUsageSection: content.includes('## Usage') || content.includes('# Usage'),
        hasBadges: content.includes('![') && content.includes(']('),
        observations: this.extractReadmeObservations(content)
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
    const components = this.kg.query(`
      SELECT name, data->>'$.framework' as framework, data->>'$.props' as props
      FROM entities WHERE type = 'Component'
    `);

    if (components.length > 0) {
      const frameworks = new Set(components.map(c => c.framework).filter(Boolean));
      frameworks.forEach(framework => {
        this.kg.createEntity('Pattern', `${framework}Architecture`, {
          type: 'Architecture',
          framework,
          componentCount: components.filter(c => c.framework === framework).length,
          observations: [
            `${framework} architecture pattern`,
            `${components.filter(c => c.framework === framework).length} components`
          ]
        });
      });
    }

    // Analyze state management patterns
    const stores = this.kg.query(`
      SELECT name, data->>'$.technology' as technology
      FROM entities WHERE type = 'Store'
    `);

    const stateManagementTech = new Set(stores.map(s => s.technology).filter(Boolean));
    stateManagementTech.forEach(tech => {
      this.kg.createEntity('Pattern', `${tech}StateManagement`, {
        type: 'StateManagement',
        technology: tech,
        storeCount: stores.filter(s => s.technology === tech).length,
        observations: [
          `${tech} state management pattern`,
          `${stores.filter(s => s.technology === tech).length} stores`
        ]
      });
    });

    // Analyze API patterns
    const apis = this.kg.query(`
      SELECT data->>'$.method' as method, COUNT(*) as count
      FROM entities WHERE type = 'API'
      GROUP BY method
    `);

    if (apis.length > 0) {
      this.kg.createEntity('Pattern', 'RESTAPIPattern', {
        type: 'API',
        methods: apis.map(a => ({ method: a.method, count: a.count })),
        totalEndpoints: apis.reduce((sum, a) => sum + a.count, 0),
        observations: [
          `REST API pattern detected`,
          `${apis.reduce((sum, a) => sum + a.count, 0)} endpoints`,
          `Methods: ${apis.map(a => a.method).join(', ')}`
        ]
      });
    }
  }

  private async generateProjectInsights(): Promise<void> {
    console.log('💡 Generating project insights...');

    const stats = this.kg.getStats();
    
    // Complexity insights
    const complexityInsights = this.kg.query(`
      SELECT 
        type,
        COUNT(*) as count,
        AVG(json_array_length(data, '$.props')) as avg_props
      FROM entities 
      WHERE type IN ('Component', 'Store', 'Action')
      GROUP BY type
    `);

    complexityInsights.forEach(insight => {
      this.kg.createEntity('Insight', `${insight.type}Complexity`, {
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
      });
    });

    // Unused entities
    const unusedEntities = this.kg.findUnusedEntities('Component');
    if (unusedEntities.length > 0) {
      this.kg.createEntity('Insight', 'UnusedEntities', {
        type: 'CodeHealth',
        count: unusedEntities.length,
        entities: unusedEntities.map(e => e.name),
        severity: unusedEntities.length > 10 ? 'high' : 'medium',
        observations: [
          `${unusedEntities.length} potentially unused entities`,
          `Entities: ${unusedEntities.map(e => e.name).join(', ')}`
        ]
      });
    }

    // Generate test coverage insights
    const components = this.kg.query(`
      SELECT COUNT(*) as count FROM entities WHERE type = 'Component'
    `);
    const testableComponents = components[0]?.count || 0;
    const testedComponents = this.kg.query(`
      SELECT COUNT(DISTINCT e.id) as count
      FROM entities e
      JOIN relations r ON e.id = r.to_id
      WHERE e.type = 'Component' AND r.type = 'TESTED_IN'
    `)[0]?.count || 0;

    if (testableComponents > 0) {
      const coverage = (testedComponents / testableComponents) * 100;
      this.kg.createEntity('Insight', 'TestCoverage', {
        type: 'Testing',
        testableComponents,
        testedComponents,
        coveragePercentage: Math.round(coverage),
        severity: coverage < 50 ? 'high' : coverage < 80 ? 'medium' : 'low',
        observations: [
          `${Math.round(coverage)}% of components have tests`,
          `${testedComponents}/${testableComponents} components tested`
        ]
      });
    }
  }

  private printScanSummary(): void {
    const stats = this.kg.getStats();
    
    console.log('\n📈 Scan Summary:');
    console.log(`  Entities: ${stats.entities}`);
    console.log(`  Relations: ${stats.relations}`);
    console.log(`  Observations: ${stats.observations}`);

    // Entity breakdown
    const entityBreakdown = this.kg.query(`
      SELECT type, COUNT(*) as count
      FROM entities
      GROUP BY type
      ORDER BY count DESC
    `);

    console.log('\n📊 Entity Breakdown:');
    entityBreakdown.forEach(row => {
      console.log(`  ${row.type}: ${row.count}`);
    });

    // Top patterns
    const patterns = this.kg.query(`
      SELECT name
      FROM entities
      WHERE type = 'Pattern'
      LIMIT 5
    `);

    if (patterns.length > 0) {
      console.log('\n🎯 Detected Patterns:');
      patterns.forEach(pattern => {
        console.log(`  - ${pattern.name}`);
      });
    }

    // Insights summary
    const insights = this.kg.query(`
      SELECT name, data->>'$.type' as insight_type
      FROM entities
      WHERE type = 'Insight'
    `);

    if (insights.length > 0) {
      console.log('\n💡 Generated Insights:');
      insights.forEach(insight => {
        console.log(`  - ${insight.name} (${insight.insight_type})`);
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
      this.kg.query(`
        DELETE FROM entities 
        WHERE data->>'$.location' = ?
      `, [file]);
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