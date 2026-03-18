const simpleDB = require('../config/simpleDb');

const additionalWorkflows = [
  {
    name: 'Customer Support Ticket Workflow',
    input_schema: {
      customer_name: { type: 'string', required: true },
      email: { type: 'string', required: true },
      issue_type: { type: 'string', required: true, allowed_values: ['Technical', 'Billing', 'Account', 'General'] },
      priority: { type: 'string', required: true, allowed_values: ['Low', 'Medium', 'High', 'Critical'] },
      description: { type: 'string', required: true }
    },
    start_step_id: '1',
    version: 1,
    is_active: true
  },
  {
    name: 'Document Approval Workflow',
    input_schema: {
      document_title: { type: 'string', required: true },
      document_type: { type: 'string', required: true, allowed_values: ['Contract', 'Report', 'Proposal', 'Invoice'] },
      submitter_name: { type: 'string', required: true },
      department: { type: 'string', required: true },
      urgency_level: { type: 'string', required: true, allowed_values: ['Normal', 'Urgent', 'Critical'] }
    },
    start_step_id: '1',
    version: 1,
    is_active: true
  },
  {
    name: 'Leave Request Workflow',
    input_schema: {
      employee_name: { type: 'string', required: true },
      employee_id: { type: 'string', required: true },
      leave_type: { type: 'string', required: true, allowed_values: ['Annual', 'Sick', 'Personal', 'Maternity'] },
      start_date: { type: 'string', required: true },
      end_date: { type: 'string', required: true },
      reason: { type: 'string', required: false },
      backup_contact: { type: 'string', required: true }
    },
    start_step_id: '1',
    version: 1,
    is_active: true
  }
];

const additionalSteps = [
  // Customer Support Ticket Workflow Steps
  {
    id: '13',
    workflow_id: '3',
    name: 'Create Support Ticket',
    step_type: 'task',
    order: 1,
    metadata: {
      instructions: 'Customer support agent creates ticket with all details'
    }
  },
  {
    id: '14',
    workflow_id: '3',
    name: 'Triage and Assign',
    step_type: 'task',
    order: 2,
    metadata: {
      instructions: 'Senior agent triages ticket and assigns to appropriate team'
    }
  },
  {
    id: '15',
    workflow_id: '3',
    name: 'Investigate Issue',
    step_type: 'task',
    order: 3,
    metadata: {
      instructions: 'Assigned team investigates and resolves the issue'
    }
  },
  {
    id: '16',
    workflow_id: '3',
    name: 'Quality Review',
    step_type: 'approval',
    order: 4,
    metadata: {
      assignee_email: 'supervisor@company.com',
      instructions: 'Supervisor reviews the resolution for quality'
    }
  },
  {
    id: '17',
    workflow_id: '3',
    name: 'Notify Customer',
    step_type: 'notification',
    order: 5,
    metadata: {
      notification_channel: 'email',
      instructions: 'Send resolution details to customer'
    }
  },
  
  // Document Approval Workflow Steps
  {
    id: '18',
    workflow_id: '4',
    name: 'Submit Document',
    step_type: 'task',
    order: 1,
    metadata: {
      instructions: 'Employee submits document for approval'
    }
  },
  {
    id: '19',
    workflow_id: '4',
    name: 'Manager Review',
    step_type: 'approval',
    order: 2,
    metadata: {
      assignee_email: 'manager@company.com',
      instructions: 'Direct manager reviews and approves document'
    }
  },
  {
    id: '20',
    workflow_id: '4',
    name: 'Legal Review',
    step_type: 'approval',
    order: 3,
    metadata: {
      assignee_email: 'legal@company.com',
      instructions: 'Legal team reviews for compliance (if required)'
    }
  },
  {
    id: '21',
    workflow_id: '4',
    name: 'Final Approval',
    step_type: 'approval',
    order: 4,
    metadata: {
      assignee_email: 'director@company.com',
      instructions: 'Director gives final approval'
    }
  },
  {
    id: '22',
    workflow_id: '4',
    name: 'Archive Document',
    step_type: 'task',
    order: 5,
    metadata: {
      instructions: 'Approved document is archived and distributed'
    }
  },
  
  // Leave Request Workflow Steps
  {
    id: '23',
    workflow_id: '5',
    name: 'Submit Leave Request',
    step_type: 'task',
    order: 1,
    metadata: {
      instructions: 'Employee submits leave request with dates and reason'
    }
  },
  {
    id: '24',
    workflow_id: '5',
    name: 'Manager Approval',
    step_type: 'approval',
    order: 2,
    metadata: {
      assignee_email: 'manager@company.com',
      instructions: 'Manager approves or denies leave request'
    }
  },
  {
    id: '25',
    workflow_id: '5',
    name: 'HR Processing',
    step_type: 'task',
    order: 3,
    metadata: {
      instructions: 'HR updates leave balance and records'
    }
  },
  {
    id: '26',
    workflow_id: '5',
    name: 'Notify Employee',
    step_type: 'notification',
    order: 4,
    metadata: {
      notification_channel: 'email',
      instructions: 'Send leave confirmation to employee'
    }
  }
];

const additionalRules = [
  // Customer Support Ticket Workflow Rules
  {
    id: '14',
    step_id: '13',
    condition: 'priority == "Critical"',
    next_step_id: '15',
    priority: 1,
    is_default: false
  },
  {
    id: '15',
    step_id: '13',
    condition: 'priority == "High"',
    next_step_id: '15',
    priority: 2,
    is_default: false
  },
  {
    id: '16',
    step_id: '13',
    condition: 'true',
    next_step_id: '14',
    priority: 3,
    is_default: false
  },
  {
    id: '17',
    step_id: '14',
    condition: 'true',
    next_step_id: '15',
    priority: 1,
    is_default: false
  },
  {
    id: '18',
    step_id: '15',
    condition: 'true',
    next_step_id: '16',
    priority: 1,
    is_default: false
  },
  {
    id: '19',
    step_id: '16',
    condition: 'true',
    next_step_id: '17',
    priority: 1,
    is_default: false
  },
  
  // Document Approval Workflow Rules
  {
    id: '20',
    step_id: '18',
    condition: 'document_type == "Contract"',
    next_step_id: '19',
    priority: 1,
    is_default: false
  },
  {
    id: '21',
    step_id: '18',
    condition: 'document_type == "Invoice"',
    next_step_id: '19',
    priority: 2,
    is_default: false
  },
  {
    id: '22',
    step_id: '18',
    condition: 'true',
    next_step_id: '19',
    priority: 3,
    is_default: false
  },
  {
    id: '23',
    step_id: '19',
    condition: 'document_type == "Contract" || urgency_level == "Critical"',
    next_step_id: '20',
    priority: 1,
    is_default: false
  },
  {
    id: '24',
    step_id: '19',
    condition: 'true',
    next_step_id: '21',
    priority: 2,
    is_default: false
  },
  {
    id: '25',
    step_id: '20',
    condition: 'true',
    next_step_id: '21',
    priority: 1,
    is_default: false
  },
  {
    id: '26',
    step_id: '21',
    condition: 'true',
    next_step_id: '22',
    priority: 1,
    is_default: false
  },
  
  // Leave Request Workflow Rules
  {
    id: '27',
    step_id: '23',
    condition: 'leave_type == "Maternity"',
    next_step_id: '24',
    priority: 1,
    is_default: false
  },
  {
    id: '28',
    step_id: '23',
    condition: 'true',
    next_step_id: '24',
    priority: 2,
    is_default: false
  },
  {
    id: '29',
    step_id: '24',
    condition: 'true',
    next_step_id: '25',
    priority: 1,
    is_default: false
  },
  {
    id: '30',
    step_id: '25',
    condition: 'true',
    next_step_id: '26',
    priority: 1,
    is_default: false
  }
];

async function addMoreSampleData() {
  try {
    console.log('Adding more sample workflows...');
    
    // Get existing data
    const workflows = await simpleDB.readFile('workflows.json');
    const steps = await simpleDB.readFile('steps.json');
    const rules = await simpleDB.readFile('rules.json');
    
    // Add new workflows
    for (const workflow of additionalWorkflows) {
      workflow.id = await simpleDB.getNextId(workflows);
      workflow.created_at = new Date().toISOString();
      workflow.updated_at = new Date().toISOString();
      workflows.push(workflow);
    }
    
    // Add new steps
    steps.push(...additionalSteps);
    
    // Add new rules
    rules.push(...additionalRules);
    
    // Save all data
    await simpleDB.writeFile('workflows.json', workflows);
    await simpleDB.writeFile('steps.json', steps);
    await simpleDB.writeFile('rules.json', rules);
    
    console.log('Sample data added successfully!');
    console.log('\nNew workflows added:');
    additionalWorkflows.forEach(w => {
      console.log(`- ${w.name} (ID: ${w.id})`);
    });
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
}

if (require.main === module) {
  addMoreSampleData();
}

module.exports = addMoreSampleData;
