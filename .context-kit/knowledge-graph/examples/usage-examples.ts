import { AppStateKG } from '../src/index.js';

// Initialize Knowledge Graph
const kg = new AppStateKG({
  databasePath: './examples/example-kg.db',
  projectRoot: './examples',
  enableFullTextSearch: true
});

async function main() {
  console.log('🚀 Knowledge Graph Usage Examples\n');

  // 1. Document Application Components
  console.log('📝 Creating application entities...');
  
  const userStore = kg.createEntity('Store', 'UserStore', {
    location: 'src/stores/user-store.ts',
    technology: 'Zustand',
    observations: [
      'Manages user authentication state',
      'Persists to localStorage',
      'Includes profile and preferences'
    ]
  });

  const loginForm = kg.createEntity('Component', 'LoginForm', {
    location: 'src/components/auth/LoginForm.tsx',
    framework: 'React',
    observations: [
      'Form validation with Zod',
      'Optimistic UI updates',
      'Accessibility compliant'
    ]
  });

  const loginAction = kg.createEntity('Action', 'LoginAction', {
    trigger: 'User submits login form',
    preconditions: ['Valid email format', 'Password not empty'],
    location: 'UserStore.login()'
  });

  // 2. Create Relationships
  console.log('🔗 Creating relationships...');
  
  kg.createRelation(loginForm.id, userStore.id, 'USES', {
    methods: ['login', 'logout', 'isAuthenticated']
  });

  kg.createRelation(loginAction.id, userStore.id, 'MUTATES', {
    changes: ['user', 'isLoading', 'error']
  });

  // 3. Document Workflows
  console.log('🔄 Creating workflows...');
  
  const authWorkflow = kg.createEntity('Workflow', 'UserAuthentication', {
    description: 'Complete user authentication flow',
    trigger: 'User navigates to protected route'
  });

  const validatePhase = kg.createEntity('Phase', 'ValidateCredentials', {
    description: 'Validate user input and credentials'
  });

  const authenticatePhase = kg.createEntity('Phase', 'AuthenticateUser', {
    description: 'Perform authentication with backend'
  });

  kg.createRelation(authWorkflow.id, validatePhase.id, 'HAS_PHASE');
  kg.createRelation(authWorkflow.id, authenticatePhase.id, 'HAS_PHASE');
  kg.createRelation(validatePhase.id, loginAction.id, 'CONTAINS');

  // 4. Add Code Patterns
  console.log('🎯 Adding code patterns...');
  
  const optimisticPattern = kg.createEntity('Pattern', 'OptimisticUpdate', {
    template: `
const {{actionName}} = async ({{params}}) => {
  // Optimistic update
  set{{stateManager}}(state => ({
    ...state,
    {{field}}: {{optimisticValue}},
    isLoading: true
  }));

  try {
    const result = await {{apiCall}};
    set{{stateManager}}(state => ({
      ...state,
      {{field}}: result,
      isLoading: false
    }));
  } catch (error) {
    set{{stateManager}}(state => ({
      ...state,
      {{field}}: {{fallbackValue}},
      isLoading: false,
      error: error.message
    }));
  }
};`,
    rules: [
      'Always include loading state',
      'Handle error cases',
      'Provide fallback values',
      'Use descriptive action names'
    ]
  });

  kg.createRelation(loginAction.id, optimisticPattern.id, 'IMPLEMENTS');

  // 5. Query Examples
  console.log('\n📊 Running queries...\n');

  // Find state mutations
  const mutations = kg.findStateMutations('UserStore');
  console.log('State Mutations for UserStore:');
  mutations.forEach(m => {
    console.log(`  - ${m.action}: ${m.changes}`);
  });

  // Analyze impact
  const impact = kg.analyzeImpact('UserStore');
  console.log(`\nImpact Analysis for UserStore (${impact.severity} severity):`);
  console.log(`  Direct impacts: ${impact.direct.length}`);
  console.log(`  Indirect impacts: ${impact.indirect.length}`);

  // Trace workflow
  const workflow = kg.traceWorkflow('UserAuthentication');
  console.log(`\nWorkflow Trace: ${workflow.workflow.description}`);
  workflow.phases.forEach((phase, i) => {
    console.log(`  Phase ${i + 1}: ${phase.name}`);
  });

  // Search functionality
  const searchResults = kg.search('authentication');
  console.log(`\nSearch Results for "authentication":`);
  searchResults.forEach(result => {
    console.log(`  - ${result.type}: ${result.name}`);
  });

  // 6. Pattern-based Code Generation
  console.log('\n🔧 Generating code from pattern...');
  
  const newAction = await kg.generateFromPattern({
    entityType: 'Action',
    pattern: 'OptimisticUpdate',
    actionName: 'updateProfile',
    stateManager: 'Zustand',
    params: 'profileData',
    field: 'profile',
    optimisticValue: 'profileData',
    apiCall: 'api.updateProfile(profileData)',
    fallbackValue: 'state.profile'
  });

  console.log('Generated Code:');
  console.log(newAction.code);
  console.log('\nPattern Rules:');
  newAction.rules.forEach(rule => {
    console.log(`  - ${rule}`);
  });

  // 7. Validation
  console.log('\n✅ Validating workflow...');
  
  const validation = kg.validateWorkflow('UserAuthentication');
  if (validation.isValid) {
    console.log('✅ Workflow is valid');
  } else {
    console.log('❌ Workflow has issues:');
    validation.errors.forEach(error => {
      console.log(`  - ${error}`);
    });
  }

  // 8. Statistics
  console.log('\n📈 Knowledge Graph Statistics:');
  const stats = kg.getStats();
  console.log(`  Entities: ${stats.entities}`);
  console.log(`  Relations: ${stats.relations}`);
  console.log(`  Observations: ${stats.observations}`);

  // 9. Advanced Queries
  console.log('\n🔍 Advanced Queries:');
  
  const similarComponents = kg.findSimilarPatterns('LoginForm');
  console.log('Similar Components to LoginForm:');
  similarComponents.forEach(comp => {
    console.log(`  - ${comp.name} (similarity: ${comp.similarity_score})`);
  });

  // Custom SQL query
  const componentsByFramework = kg.query(`
    SELECT data->>'$.framework' as framework, COUNT(*) as count
    FROM entities 
    WHERE type = 'Component' 
      AND data->>'$.framework' IS NOT NULL
    GROUP BY framework
  `);
  
  console.log('\nComponents by Framework:');
  componentsByFramework.forEach(row => {
    console.log(`  - ${row.framework}: ${row.count}`);
  });

  console.log('\n🎉 Examples completed successfully!');
  
  // Clean up
  kg.close();
}

// Run examples
main().catch(console.error);