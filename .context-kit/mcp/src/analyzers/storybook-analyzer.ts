import { readFileSync } from 'fs';
import { glob } from 'glob';
import { basename, relative } from 'path';
import * as ts from 'typescript';
import { AppStateKGSimple } from '../database/knowledge-graph-simple.js';
import { StoryInfo } from '../database/types.js';

export interface StorybookAnalysisOptions {
  projectRoot: string;
  storiesPattern?: string;
  ignorePatterns?: string[];
}

interface StoryMetadata {
  title: string;
  component: string;
  parameters?: Record<string, any>;
  argTypes?: Record<string, any>;
}

interface Story {
  name: string;
  args?: Record<string, any>;
  play?: string;
  parameters?: Record<string, any>;
}

export class StorybookAnalyzer {
  private kg: AppStateKGSimple;

  constructor(kg: AppStateKGSimple) {
    this.kg = kg;
  }

  async analyzeStorybook(options: StorybookAnalysisOptions): Promise<void> {
    console.log('📚 Starting Storybook analysis...');

    // Find all story files
    const storyFiles = await this.findStoryFiles(options);
    console.log(`Found ${storyFiles.length} story files to analyze`);

    // Analyze each story file
    for (const file of storyFiles) {
      await this.analyzeStoryFile(file, options.projectRoot);
    }

    // Extract patterns from stories
    await this.extractPatternsFromStories();

    console.log('✅ Storybook analysis complete');
  }

  private async findStoryFiles(options: StorybookAnalysisOptions): Promise<string[]> {
    const pattern = options.storiesPattern || '**/*.stories.{ts,tsx,js,jsx}';
    
    const files = await glob(pattern, {
      cwd: options.projectRoot,
      absolute: true,
      ignore: options.ignorePatterns || ['**/node_modules/**', '**/dist/**', '**/build/**']
    });

    return files;
  }

  private async analyzeStoryFile(filePath: string, projectRoot: string): Promise<void> {
    const content = readFileSync(filePath, 'utf8');
    const relativePath = relative(projectRoot, filePath);
    
    console.log(`  Analyzing: ${relativePath}`);

    // Parse the file
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.ESNext,
      true
    );

    // Extract story metadata
    const metadata = this.extractStoryMetadata(sourceFile);
    if (!metadata) {
      console.warn(`    ⚠️  Could not extract metadata from ${relativePath}`);
      return;
    }

    // Extract individual stories
    const stories = this.extractStories(sourceFile);

    // Create entities and relationships
    this.createStorybookEntities(metadata, stories, relativePath);
  }

  private extractStoryMetadata(sourceFile: ts.SourceFile): StoryMetadata | null {
    let metadata: StoryMetadata | null = null;

    ts.forEachChild(sourceFile, node => {
      // Look for default export
      if (ts.isExportAssignment(node) && !node.isExportEquals) {
        if (ts.isObjectLiteralExpression(node.expression)) {
          metadata = this.parseMetadataObject(node.expression);
        }
      }
      
      // ES6 export default
      if (ts.isVariableStatement(node)) {
        node.declarationList.declarations.forEach(decl => {
          if (decl.name.getText() === 'default' && 
              decl.initializer && 
              ts.isObjectLiteralExpression(decl.initializer)) {
            metadata = this.parseMetadataObject(decl.initializer);
          }
        });
      }
    });

    return metadata;
  }

  private parseMetadataObject(obj: ts.ObjectLiteralExpression): StoryMetadata {
    const metadata: StoryMetadata = {
      title: '',
      component: ''
    };

    obj.properties.forEach(prop => {
      if (ts.isPropertyAssignment(prop)) {
        const name = prop.name?.getText();
        
        switch (name) {
          case 'title':
            if (ts.isStringLiteral(prop.initializer)) {
              metadata.title = prop.initializer.text;
            }
            break;
          
          case 'component':
            metadata.component = prop.initializer.getText();
            break;
          
          case 'parameters':
            if (ts.isObjectLiteralExpression(prop.initializer)) {
              metadata.parameters = this.extractObjectLiteral(prop.initializer);
            }
            break;
          
          case 'argTypes':
            if (ts.isObjectLiteralExpression(prop.initializer)) {
              metadata.argTypes = this.extractObjectLiteral(prop.initializer);
            }
            break;
        }
      }
    });

    return metadata;
  }

  private extractStories(sourceFile: ts.SourceFile): Story[] {
    const stories: Story[] = [];

    ts.forEachChild(sourceFile, node => {
      // Look for exported const stories
      if (ts.isVariableStatement(node) && 
          node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
        
        node.declarationList.declarations.forEach(decl => {
          const storyName = decl.name.getText();
          
          // Skip 'default' export
          if (storyName === 'default') return;
          
          if (decl.initializer && ts.isObjectLiteralExpression(decl.initializer)) {
            const story = this.parseStoryObject(storyName, decl.initializer);
            stories.push(story);
          }
        });
      }

      // Look for export { Primary, Secondary, etc }
      if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
        // These would need to be matched with their declarations
      }
    });

    return stories;
  }

  private parseStoryObject(name: string, obj: ts.ObjectLiteralExpression): Story {
    const story: Story = { name };

    obj.properties.forEach(prop => {
      if (ts.isPropertyAssignment(prop)) {
        const propName = prop.name?.getText();
        
        switch (propName) {
          case 'args':
            if (ts.isObjectLiteralExpression(prop.initializer)) {
              story.args = this.extractObjectLiteral(prop.initializer);
            }
            break;
          
          case 'play':
            story.play = prop.initializer.getText();
            break;
          
          case 'parameters':
            if (ts.isObjectLiteralExpression(prop.initializer)) {
              story.parameters = this.extractObjectLiteral(prop.initializer);
            }
            break;
        }
      }
    });

    return story;
  }

  private extractObjectLiteral(obj: ts.ObjectLiteralExpression): Record<string, any> {
    const result: Record<string, any> = {};

    obj.properties.forEach(prop => {
      if (ts.isPropertyAssignment(prop)) {
        const name = prop.name?.getText() || '';
        const value = this.extractValue(prop.initializer);
        result[name] = value;
      }
    });

    return result;
  }

  private extractValue(node: ts.Node): any {
    if (ts.isStringLiteral(node)) {
      return node.text;
    } else if (ts.isNumericLiteral(node)) {
      return Number(node.text);
    } else if (node.kind === ts.SyntaxKind.TrueKeyword) {
      return true;
    } else if (node.kind === ts.SyntaxKind.FalseKeyword) {
      return false;
    } else if (node.kind === ts.SyntaxKind.NullKeyword) {
      return null;
    } else if (ts.isObjectLiteralExpression(node)) {
      return this.extractObjectLiteral(node);
    } else if (ts.isArrayLiteralExpression(node)) {
      return node.elements.map(el => this.extractValue(el));
    } else {
      return node.getText();
    }
  }

  private createStorybookEntities(metadata: StoryMetadata, stories: Story[], filePath: string): void {
    // Create StoryCollection entity
    const collection = this.kg.createEntity('StoryCollection', metadata.title, {
      location: filePath,
      component: metadata.component,
      parameters: metadata.parameters,
      argTypes: metadata.argTypes,
      storyCount: stories.length,
      observations: [
        `Located in ${filePath}`,
        `Contains ${stories.length} stories`,
        `Component: ${metadata.component}`
      ]
    });

    // Link to component if it exists
    const componentName = this.extractComponentName(metadata.component);
    const component = this.kg.getEntityByName('Component', componentName);
    if (component) {
      this.kg.createRelation(collection.id, component.id, 'DOCUMENTS');
    }

    // Create individual story entities
    stories.forEach(story => {
      const storyEntity = this.kg.createEntity('Story', `${metadata.title}/${story.name}`, {
        collection: metadata.title,
        args: story.args,
        hasPlayFunction: !!story.play,
        parameters: story.parameters,
        observations: this.extractStoryObservations(story)
      });

      // Create relations
      this.kg.createRelation(storyEntity.id, collection.id, 'BELONGS_TO');

      // Extract visual states
      if (story.args) {
        this.createVisualStateEntity(componentName, story);
      }

      // Extract interactions from play function
      if (story.play) {
        this.extractInteractionsFromPlay(storyEntity, story.play);
      }
    });
  }

  private extractComponentName(componentRef: string): string {
    // Remove import references and get just the component name
    const matchResult = componentRef.match(/(\w+)$/);
    return matchResult ? matchResult[1] : componentRef;
  }

  private extractStoryObservations(story: Story): string[] {
    const observations: string[] = [];

    if (story.args) {
      const argKeys = Object.keys(story.args);
      observations.push(`Props configured: ${argKeys.join(', ')}`);
      
      // Look for specific patterns
      if (story.args.loading) observations.push('Demonstrates loading state');
      if (story.args.error) observations.push('Demonstrates error state');
      if (story.args.disabled) observations.push('Demonstrates disabled state');
    }

    if (story.play) {
      observations.push('Has interaction tests');
    }

    if (story.parameters?.docs?.description) {
      observations.push(story.parameters.docs.description);
    }

    return observations;
  }

  private createVisualStateEntity(componentName: string, story: Story): void {
    const stateName = `${componentName}_${story.name}`;
    
    const visualState = this.kg.createEntity('VisualState', stateName, {
      component: componentName,
      story: story.name,
      props: story.args,
      description: story.parameters?.docs?.description,
      observations: [
        `Visual state for ${componentName}`,
        `Story: ${story.name}`,
        story.args ? `Props: ${JSON.stringify(story.args)}` : 'Default props'
      ]
    });

    // Link to component
    const component = this.kg.getEntityByName('Component', componentName);
    if (component) {
      this.kg.createRelation(visualState.id, component.id, 'DEMONSTRATES_STATE_OF');
    }
  }

  private extractInteractionsFromPlay(storyEntity: any, playFunction: string): void {
    // Extract user interactions from play function
    const interactions: Array<{action: string, target: string}> = [];

    // Pattern matching for common testing library patterns
    const clickMatches: string[] = playFunction.match(/userEvent\.click\(([^)]+)\)/g) || [];
    const typeMatches: string[] = playFunction.match(/userEvent\.type\(([^)]+)\)/g) || [];
    const expectMatches: string[] = playFunction.match(/expect\(([^)]+)\)/g) || [];

    clickMatches.forEach(matchStr => {
      const target = matchStr.match(/getBy\w+\('([^']+)'\)/)?.[1] || 'element';
      interactions.push({ action: 'click', target });
    });

    typeMatches.forEach(matchStr => {
      const parts: string[] | null = matchStr.match(/getBy\w+\('([^']+)'\)[^,]+,\s*'([^']+)'/);
      if (parts) {
        interactions.push({ action: 'type', target: `${parts[1]}: "${parts[2]}"` });
      }
    });

    // Create interaction entities
    interactions.forEach((interaction, index) => {
      const interactionEntity = this.kg.createEntity('UserInteraction', 
        `${storyEntity.name}_interaction_${index}`, {
        action: interaction.action,
        target: interaction.target,
        story: storyEntity.name,
        observations: [
          `User ${interaction.action}s ${interaction.target}`,
          `Part of ${storyEntity.name} story`
        ]
      });

      this.kg.createRelation(interactionEntity.id, storyEntity.id, 'TESTED_IN');
    });

    // Extract expectations
    expectMatches.forEach((matchStr, index) => {
      const expectation = this.kg.createEntity('TestExpectation',
        `${storyEntity.name}_expect_${index}`, {
        expression: matchStr,
        story: storyEntity.name,
        observations: [`Assertion: ${matchStr}`]
      });

      this.kg.createRelation(expectation.id, storyEntity.id, 'VERIFIED_IN');
    });
  }

  private async extractPatternsFromStories(): Promise<void> {
    console.log('  🎯 Extracting patterns from stories...');

    // Find common prop combinations
    const visualStates = this.kg.query(`
      SELECT name, data->>'$.props' as props
      FROM entities 
      WHERE type = 'VisualState'
    `);

    const propPatterns = new Map<string, number>();
    visualStates.forEach(state => {
      if (state.props) {
        const propKeys = Object.keys(JSON.parse(state.props)).sort().join(',');
        propPatterns.set(propKeys, (propPatterns.get(propKeys) || 0) + 1);
      }
    });

    // Create pattern entities for common prop combinations
    propPatterns.forEach((count, pattern) => {
      if (count > 2) { // Pattern appears in more than 2 stories
        this.kg.createEntity('Pattern', `CommonProps_${pattern.replace(/,/g, '_')}`, {
          type: 'PropCombination',
          props: pattern.split(','),
          frequency: count,
          observations: [
            `Common prop combination used ${count} times`,
            `Props: ${pattern}`
          ]
        });
      }
    });

    // Find interaction patterns
    const interactions = this.kg.query(`
      SELECT 
        data->>'$.action' as action,
        COUNT(*) as count
      FROM entities
      WHERE type = 'UserInteraction'
      GROUP BY action
      ORDER BY count DESC
    `);

    interactions.forEach(pattern => {
      if (pattern.count > 3) {
        this.kg.createEntity('Pattern', `InteractionPattern_${pattern.action}`, {
          type: 'UserInteraction',
          action: pattern.action,
          frequency: pattern.count,
          observations: [
            `Common interaction pattern: ${pattern.action}`,
            `Used ${pattern.count} times in stories`
          ]
        });
      }
    });
  }

  // Analyze Storybook documentation
  async analyzeStorybookDocs(options: StorybookAnalysisOptions): Promise<void> {
    console.log('📖 Analyzing Storybook documentation...');

    const mdxFiles = await glob('**/*.mdx', {
      cwd: options.projectRoot,
      absolute: true,
      ignore: ['**/node_modules/**']
    });

    for (const file of mdxFiles) {
      const content = readFileSync(file, 'utf8');
      const relativePath = relative(options.projectRoot, file);

      // Extract documentation patterns
      const title = content.match(/# (.+)/)?.[1] || basename(file, '.mdx');
      
      const doc = this.kg.createEntity('Documentation', title, {
        location: relativePath,
        type: 'MDX',
        observations: this.extractDocObservations(content)
      });

      // Link to related components
      const componentMatches: string[] = content.match(/<Story of={(\w+)}/g) || [];
      componentMatches.forEach(matchStr => {
        const componentName = matchStr.match(/of={(\w+)}/)?.[1];
        if (componentName) {
          const component = this.kg.getEntityByName('Component', componentName);
          if (component) {
            this.kg.createRelation(doc.id, component.id, 'DOCUMENTS');
          }
        }
      });
    }
  }

  private extractDocObservations(content: string): string[] {
    const observations: string[] = [];

    // Extract key sections
    if (content.includes('## Usage')) observations.push('Contains usage examples');
    if (content.includes('## Props')) observations.push('Documents component props');
    if (content.includes('## Examples')) observations.push('Includes code examples');
    if (content.includes('## Accessibility')) observations.push('Documents accessibility features');
    if (content.includes('## API')) observations.push('Contains API documentation');

    // Count code blocks
    const codeBlocks = (content.match(/```/g) || []).length / 2;
    if (codeBlocks > 0) observations.push(`Contains ${codeBlocks} code examples`);

    return observations;
  }
}