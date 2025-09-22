import { readFileSync } from 'fs';
import { glob } from 'glob';
import { basename, relative } from 'path';
import * as ts from 'typescript';
import { KnowledgeGraph, type Entity } from '@tkr-context-kit/core';

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
  private kg: KnowledgeGraph;

  constructor(kg: KnowledgeGraph) {
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
    await this.createStorybookEntities(metadata, stories, relativePath);
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

  private async createStorybookEntities(metadata: StoryMetadata, stories: Story[], filePath: string): Promise<void> {
    // Create StoryCollection entity
    const collection = await this.kg.createEntity({
      type: 'StoryCollection',
      name: metadata.title,
      data: {
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
      }
    });

    // Link to component if it exists
    const componentName = this.extractComponentName(metadata.component);
    const components = await this.kg.getEntities({ type: 'Component', name: componentName });
    const component = components[0];
    if (component) {
      await this.kg.createRelation({
        from_id: collection.id,
        to_id: component.id,
        type: 'DOCUMENTS'
      });
    }

    // Create individual story entities
    for (const story of stories) {
      const storyEntity = await this.kg.createEntity({
        type: 'Story',
        name: `${metadata.title}/${story.name}`,
        data: {
          collection: metadata.title,
          args: story.args,
          hasPlayFunction: !!story.play,
          parameters: story.parameters,
          observations: this.extractStoryObservations(story)
        }
      });

      // Create relations
      await this.kg.createRelation({
        from_id: storyEntity.id,
        to_id: collection.id,
        type: 'BELONGS_TO'
      });

      // Extract visual states
      if (story.args) {
        await this.createVisualStateEntity(componentName, story);
      }

      // Extract interactions from play function
      if (story.play) {
        await this.extractInteractionsFromPlay(storyEntity, story.play);
      }
    }
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

  private async createVisualStateEntity(componentName: string, story: Story): Promise<void> {
    const stateName = `${componentName}_${story.name}`;

    const visualState = await this.kg.createEntity({
      type: 'VisualState',
      name: stateName,
      data: {
        component: componentName,
        story: story.name,
        props: story.args,
        description: story.parameters?.docs?.description,
        observations: [
          `Visual state for ${componentName}`,
          `Story: ${story.name}`,
          story.args ? `Props: ${JSON.stringify(story.args)}` : 'Default props'
        ]
      }
    });

    // Link to component
    const components = await this.kg.getEntities({ type: 'Component', name: componentName });
    const component = components[0];
    if (component) {
      await this.kg.createRelation({
        from_id: visualState.id,
        to_id: component.id,
        type: 'DEMONSTRATES_STATE_OF'
      });
    }
  }

  private async extractInteractionsFromPlay(storyEntity: any, playFunction: string): Promise<void> {
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
    for (const [index, interaction] of interactions.entries()) {
      const interactionEntity = await this.kg.createEntity({
        type: 'UserInteraction',
        name: `${storyEntity.name}_interaction_${index}`,
        data: {
          action: interaction.action,
          target: interaction.target,
          story: storyEntity.name,
          observations: [
            `User ${interaction.action}s ${interaction.target}`,
            `Part of ${storyEntity.name} story`
          ]
        }
      });

      await this.kg.createRelation({
        from_id: interactionEntity.id,
        to_id: storyEntity.id,
        type: 'TESTED_IN'
      });
    }

    // Extract expectations
    for (const [index, matchStr] of expectMatches.entries()) {
      const expectation = await this.kg.createEntity({
        type: 'TestExpectation',
        name: `${storyEntity.name}_expect_${index}`,
        data: {
          expression: matchStr,
          story: storyEntity.name,
          observations: [`Assertion: ${matchStr}`]
        }
      });

      await this.kg.createRelation({
        from_id: expectation.id,
        to_id: storyEntity.id,
        type: 'VERIFIED_IN'
      });
    }
  }

  private async extractPatternsFromStories(): Promise<void> {
    console.log('  🎯 Extracting patterns from stories...');

    // Find common prop combinations
    const visualStates = await this.kg.getEntities({ type: 'VisualState' });

    const propPatterns = new Map<string, number>();
    visualStates.forEach(state => {
      if (state.data.props) {
        const propKeys = Object.keys(state.data.props).sort().join(',');
        propPatterns.set(propKeys, (propPatterns.get(propKeys) || 0) + 1);
      }
    });

    // Create pattern entities for common prop combinations
    for (const [pattern, count] of propPatterns.entries()) {
      if (count > 2) { // Pattern appears in more than 2 stories
        await this.kg.createEntity({
          type: 'Pattern',
          name: `CommonProps_${pattern.replace(/,/g, '_')}`,
          data: {
            type: 'PropCombination',
            props: pattern.split(','),
            frequency: count,
            observations: [
              `Common prop combination used ${count} times`,
              `Props: ${pattern}`
            ]
          }
        });
      }
    }

    // Find interaction patterns
    const interactions = await this.kg.getEntities({ type: 'UserInteraction' });
    const actionCounts = new Map<string, number>();
    interactions.forEach(interaction => {
      const action = interaction.data.action;
      if (action) {
        actionCounts.set(action, (actionCounts.get(action) || 0) + 1);
      }
    });

    for (const [action, count] of actionCounts.entries()) {
      if (count > 3) {
        await this.kg.createEntity({
          type: 'Pattern',
          name: `InteractionPattern_${action}`,
          data: {
            type: 'UserInteraction',
            action: action,
            frequency: count,
            observations: [
              `Common interaction pattern: ${action}`,
              `Used ${count} times in stories`
            ]
          }
        });
      }
    }
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
      
      const doc = await this.kg.createEntity({
        type: 'Documentation',
        name: title,
        data: {
          location: relativePath,
          type: 'MDX',
          observations: this.extractDocObservations(content)
        }
      });

      // Link to related components
      const componentMatches: string[] = content.match(/<Story of={(\w+)}/g) || [];
      for (const matchStr of componentMatches) {
        const componentName = matchStr.match(/of={(\w+)}/)?.[1];
        if (componentName) {
          const components = await this.kg.getEntities({ type: 'Component', name: componentName });
          const component = components[0];
          if (component) {
            await this.kg.createRelation({
              from_id: doc.id,
              to_id: component.id,
              type: 'DOCUMENTS'
            });
          }
        }
      }
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