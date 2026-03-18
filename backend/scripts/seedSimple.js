const simpleDB = require('../config/simpleDb');

const sampleWorkflows = [
  {
    id: '1',
    name: 'Expense Approval Workflow',
    version: 1,
    is_active: true,
    input_schema: {
      amount: { type: 'number', required: true },
      department: { type: 'string', required: true },
      employee_name: { type: 'string', required: true },
      expense_type: { type: 'string', required: true, allowed_values: ['Travel', 'Meals', 'Office', 'Training'] },
      description: { type: 'string', required: false }
    },
    start_step_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Employee Onboarding Workflow',
    version: 1,
    is_active: true,
    input_schema: {
      employee_name: { type: 'string', required: true },
      email: { type: 'string', required: true },
      department: { type: 'string', required: true },
      position: { type: 'string', required: true },
      start_date: { type: 'string', required: true },
      salary: { type: 'number', required: true },
      is_remote: { type: 'boolean', required: false }
    },
    start_step_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const sampleSteps = [
  // Expense Approval Workflow Steps
  {
    id: '1',
    workflow_id: '1',
    name: 'Submit Expense',
    step_type: 'task',
    order: 1,
    metadata: {
      instructions: 'Employee submits expense report with all required details'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    workflow_id: '1',
    name: 'Manager Review',
    step_type: 'approval',
    order: 2,
    metadata: {
      assignee_email: 'manager@company.com',
      instructions: 'Review expense details and approve or reject'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    workflow_id: '1',
    name: 'Finance Approval',
    step_type: 'approval',
    order: 3,
    metadata: {
      assignee_email: 'finance@company.com',
      instructions: 'Review and approve expenses over $1000'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    workflow_id: '1',
    name: 'Process Payment',
    step_type: 'task',
    order: 4,
    metadata: {
      instructions: 'Process approved expense payment'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    workflow_id: '1',
    name: 'Notify Employee',
    step_type: 'notification',
    order: 5,
    metadata: {
      notification_channel: 'email',
      instructions: 'Send payment confirmation to employee'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Employee Onboarding Workflow Steps
  {
    id: '6',
    workflow_id: '2',
    name: 'Create Employee Record',
    step_type: 'task',
    order: 1,
    metadata: {
      instructions: 'HR creates employee record in HR system'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '7',
    workflow_id: '2',
    name: 'Setup Email Account',
    step_type: 'task',
    order: 2,
    metadata: {
      instructions: 'IT creates email account and sends credentials'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '8',
    workflow_id: '2',
    name: 'Equipment Setup',
    step_type: 'task',
    order: 3,
    metadata: {
      instructions: 'IT prepares laptop and other equipment'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '9',
    workflow_id: '2',
    name: 'Access Permissions',
    step_type: 'approval',
    order: 4,
    metadata: {
      assignee_email: 'it-manager@company.com',
      instructions: 'Approve system access permissions'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '10',
    workflow_id: '2',
    name: 'Welcome Kit',
    step_type: 'task',
    order: 5,
    metadata: {
      instructions: 'HR prepares welcome kit and documentation'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '11',
    workflow_id: '2',
    name: 'Schedule Orientation',
    step_type: 'task',
    order: 6,
    metadata: {
      instructions: 'Schedule orientation and training sessions'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '12',
    workflow_id: '2',
    name: 'Send Welcome Email',
    step_type: 'notification',
    order: 7,
    metadata: {
      notification_channel: 'email',
      instructions: 'Send welcome email with onboarding details'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const sampleRules = [
  // Expense Approval Workflow Rules
  {
    id: '1',
    step_id: '1',
    condition: 'amount <= 1000',
    next_step_id: '2',
    priority: 1,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    step_id: '1',
    condition: 'amount > 1000',
    next_step_id: '3',
    priority: 2,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    step_id: '2',
    condition: 'amount <= 500',
    next_step_id: '4',
    priority: 1,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    step_id: '2',
    condition: 'amount > 500',
    next_step_id: '3',
    priority: 2,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    step_id: '3',
    condition: 'true',
    next_step_id: '4',
    priority: 1,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    step_id: '4',
    condition: 'true',
    next_step_id: '5',
    priority: 1,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Employee Onboarding Workflow Rules
  {
    id: '7',
    step_id: '6',
    condition: 'true',
    next_step_id: '7',
    priority: 1,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '8',
    step_id: '7',
    condition: 'true',
    next_step_id: '8',
    priority: 1,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '9',
    step_id: '8',
    condition: 'is_remote == true',
    next_step_id: '9',
    priority: 1,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '10',
    step_id: '8',
    condition: 'is_remote == false',
    next_step_id: '10',
    priority: 2,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '11',
    step_id: '9',
    condition: 'true',
    next_step_id: '10',
    priority: 1,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '12',
    step_id: '10',
    condition: 'true',
    next_step_id: '11',
    priority: 1,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '13',
    step_id: '11',
    condition: 'true',
    next_step_id: '12',
    priority: 1,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

async function seedDatabase() {
  try {
    console.log('Seeding database with sample workflows...');
    
    await simpleDB.writeFile('workflows.json', sampleWorkflows);
    await simpleDB.writeFile('steps.json', sampleSteps);
    await simpleDB.writeFile('rules.json', sampleRules);
    await simpleDB.writeFile('executions.json', []);
    
    console.log('Database seeded successfully!');
    console.log('\nSample workflows created:');
    sampleWorkflows.forEach(w => {
      console.log(`- ${w.name} (ID: ${w.id})`);
    });
    
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
