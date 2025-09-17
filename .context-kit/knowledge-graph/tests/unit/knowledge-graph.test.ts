import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AppStateKG } from '../../src/core/knowledge-graph.js';
import { unlinkSync } from 'fs';

describe('AppStateKG', () => {
  let kg: AppStateKG;
  const testDbPath = './test-kg.db';

  beforeEach(() => {
    kg = new AppStateKG({ databasePath: testDbPath });
  });

  afterEach(() => {
    kg.close();
    try {
      unlinkSync(testDbPath);
    } catch (e) {
      // File might not exist
    }
  });

  describe('Entity Management', () => {
    it('should create an entity', () => {
      const entity = kg.createEntity('Component', 'Button', {
        location: 'src/components/Button.tsx',
        props: ['onClick', 'children', 'variant']
      });

      expect(entity.id).toMatch(/^component_/);
      expect(entity.type).toBe('Component');
      expect(entity.name).toBe('Button');
      expect(entity.location).toBe('src/components/Button.tsx');
    });

    it('should retrieve an entity by ID', () => {
      const created = kg.createEntity('Store', 'UserStore', {
        location: 'src/stores/user.ts',
        technology: 'Zustand'
      });

      const retrieved = kg.getEntity(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved!.name).toBe('UserStore');
      expect(retrieved!.data.technology).toBe('Zustand');
    });

    it('should retrieve an entity by name and type', () => {
      kg.createEntity('Action', 'LoginAction', {
        trigger: 'User submits login form'
      });

      const retrieved = kg.getEntityByName('Action', 'LoginAction');
      expect(retrieved).toBeDefined();
      expect(retrieved!.data.trigger).toBe('User submits login form');
    });

    it('should update an entity', () => {
      const entity = kg.createEntity('Component', 'Modal', {
        props: ['isOpen', 'onClose']
      });

      const updated = kg.updateEntity(entity.id, 'Modal', {
        props: ['isOpen', 'onClose', 'title'],
        accessibility: 'ARIA compliant'
      });

      expect(updated.data.props).toHaveLength(3);
      expect(updated.data.accessibility).toBe('ARIA compliant');
      expect(updated.version).toBe(2);
    });

    it('should delete an entity', () => {
      const entity = kg.createEntity('Pattern', 'OptimisticUpdate', {
        template: 'const update = () => { /* template */ }'
      });

      const deleted = kg.deleteEntity(entity.id);
      expect(deleted).toBe(true);

      const retrieved = kg.getEntity(entity.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('Relation Management', () => {
    it('should create relations between entities', () => {
      const component = kg.createEntity('Component', 'LoginForm', {});
      const store = kg.createEntity('Store', 'AuthStore', {});

      const relation = kg.createRelation(component.id, store.id, 'USES', {
        methods: ['login', 'logout']
      });

      expect(relation.from_id).toBe(component.id);
      expect(relation.to_id).toBe(store.id);
      expect(relation.type).toBe('USES');
      expect(relation.properties.methods).toEqual(['login', 'logout']);
    });

    it('should retrieve relations for an entity', () => {
      const action = kg.createEntity('Action', 'UpdateProfile', {});
      const store = kg.createEntity('Store', 'UserStore', {});

      kg.createRelation(action.id, store.id, 'MUTATES', {
        fields: ['name', 'email']
      });

      const relations = kg.getRelationsByEntity(action.id);
      expect(relations).toHaveLength(1);
      expect(relations[0].type).toBe('MUTATES');
    });
  });

  describe('Observations', () => {
    it('should store observations from entity data', () => {
      const entity = kg.createEntity('Component', 'DataTable', {
        observations: [
          'Supports pagination',
          'Has sorting functionality',
          { performance: 'Virtualized for large datasets' }
        ]
      });

      const observations = kg.getObservations(entity.id);
      expect(observations).toHaveLength(3);
      expect(observations.some(o => o.value === 'Supports pagination')).toBe(true);
      expect(observations.some(o => o.key === 'performance')).toBe(true);
    });

    it('should add individual observations', () => {
      const entity = kg.createEntity('Store', 'CartStore', {});
      
      kg.addObservation(entity.id, 'pattern', 'Uses reducer pattern');
      kg.addObservation(entity.id, 'persistence', 'LocalStorage backed');

      const observations = kg.getObservations(entity.id);
      expect(observations).toHaveLength(2);
    });
  });

  describe('Domain Queries', () => {
    beforeEach(() => {
      // Set up test data
      const store = kg.createEntity('Store', 'ProductStore', {});
      const action = kg.createEntity('Action', 'AddProduct', { 
        trigger: 'User clicks add product' 
      });
      
      kg.createRelation(action.id, store.id, 'MUTATES', {
        changes: 'products array, loading state'
      });
    });

    it('should find state mutations', () => {
      const mutations = kg.findStateMutations('ProductStore');
      expect(mutations).toHaveLength(1);
      expect(mutations[0].action).toBe('AddProduct');
      expect(mutations[0].store).toBe('ProductStore');
    });

    it('should analyze impact', () => {
      const productStore = kg.getEntityByName('Store', 'ProductStore')!;
      const component = kg.createEntity('Component', 'ProductList', {});
      
      kg.createRelation(component.id, productStore.id, 'CONSUMES');

      const impact = kg.analyzeImpact('ProductStore');
      expect(impact.entity).toBe('ProductStore');
      expect(impact.direct).toHaveLength(1);
      expect(impact.direct[0].impacted_entity).toBe('ProductList');
    });
  });

  describe('Search', () => {
    beforeEach(() => {
      kg.createEntity('Component', 'SearchBar', {
        observations: ['Implements debounced search', 'Uses Fuse.js library']
      });
      
      kg.createEntity('Component', 'FilterPanel', {
        observations: ['Advanced search filters', 'Category-based filtering']
      });
    });

    it('should perform full-text search', () => {
      const results = kg.search('search');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.name === 'SearchBar')).toBe(true);
    });

    it('should limit search results', () => {
      const results = kg.search('search', 1);
      expect(results).toHaveLength(1);
    });
  });

  describe('Pattern Generation', () => {
    beforeEach(() => {
      // Create a pattern template
      kg.createEntity('Pattern', 'StateUpdate', {
        template: `const {{name}} = () => {
  set{{stateManager}}((state) => ({
    ...state,
    {{field}}: {{value}}
  }));
};`,
        rules: ['Use camelCase for function names', 'Always spread existing state']
      });

      // Create an example implementation
      const example = kg.createEntity('Action', 'UpdateUserName', {});
      const pattern = kg.getEntityByName('Pattern', 'StateUpdate')!;
      kg.createRelation(example.id, pattern.id, 'IMPLEMENTS');
    });

    it('should generate code from pattern', async () => {
      const spec = {
        entityType: 'Action',
        pattern: 'StateUpdate',
        name: 'updateEmail',
        stateManager: 'Zustand',
        field: 'email',
        value: 'newEmail'
      };

      const generated = await kg.generateFromPattern(spec);
      expect(generated.code).toContain('updateEmail');
      expect(generated.code).toContain('setZustand');
      expect(generated.code).toContain('email: newEmail');
      expect(generated.rules).toContain('Use camelCase for function names');
    });
  });

  describe('Validation', () => {
    it('should validate workflow structure', () => {
      const workflow = kg.createEntity('Workflow', 'UserRegistration', {});
      const phase1 = kg.createEntity('Phase', 'ValidateInput', {});
      const phase2 = kg.createEntity('Phase', 'CreateAccount', {});

      kg.createRelation(workflow.id, phase1.id, 'HAS_PHASE');
      kg.createRelation(workflow.id, phase2.id, 'HAS_PHASE');

      const validation = kg.validateWorkflow('UserRegistration');
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect workflow issues', () => {
      kg.createEntity('Workflow', 'EmptyWorkflow', {});

      const validation = kg.validateWorkflow('EmptyWorkflow');
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Workflow has no phases');
    });
  });

  describe('Batch Operations', () => {
    it('should create multiple entities in a transaction', () => {
      const entities = [
        { type: 'Component', name: 'Header', data: {} },
        { type: 'Component', name: 'Footer', data: {} },
        { type: 'Component', name: 'Sidebar', data: {} }
      ];

      const created = kg.createEntities(entities);
      expect(created).toHaveLength(3);
      expect(created.map(e => e.name)).toEqual(['Header', 'Footer', 'Sidebar']);
    });
  });

  describe('Statistics', () => {
    it('should provide database statistics', () => {
      kg.createEntity('Component', 'TestComponent', {});
      kg.createEntity('Store', 'TestStore', {});

      const stats = kg.getStats();
      expect(stats.entities).toBe(2);
      expect(stats.relations).toBe(0);
    });
  });
});