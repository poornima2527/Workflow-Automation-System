const mongoose = require('mongoose');
const Workflow = require('../models/Workflow');
const Step = require('../models/Step');
const Rule = require('../models/Rule');
require('dotenv').config();

const sampleWorkflows = [
  {
    name: 'Expense Approval Workflow',
    input_schema: {
      amount: { type: 'number', required: true },
      department: { type: 'string', required: true },
      employee_name: { type: 'string', required: true },
      expense_type: { type: 'string', required: true, allowed_values: ['Travel', 'Meals', 'Office', 'Training'] },
      description: { type: 'string', required: false }
    },
    steps: [
      {
        name: 'Submit Expense',
        step_type: 'task',
        metadata: {
          instructions: 'Employee submits expense report with all required details'
        }
      },
      {
        name: 'Manager Review',
        step_type: 'approval',
        metadata: {
          assignee_email: 'manager@company.com',
          instructions: 'Review expense details and approve or reject'
        }
      },
      {
        name: 'Finance Approval',
        step_type: 'approval',
        metadata: {
          assignee_email: 'finance@company.com',
          instructions: 'Review and approve expenses over $1000'
        }
      },
      {
        name: 'Process Payment',
        step_type: 'task',
        metadata: {
          instructions: 'Process approved expense payment'
        }
      },
      {
        name: 'Notify Employee',
        step_type: 'notification',
        metadata: {
          notification_channel: 'email',
          instructions: 'Send payment confirmation to employee'
        }
      }
    ],
    rules: [
      {
        step_name: 'Submit Expense',
        condition: 'amount <= 1000',
        next_step_name: 'Manager Review',
        priority: 1
      },
      {
        step_name: 'Submit Expense',
        condition: 'amount > 1000',
        next_step_name: 'Finance Approval',
        priority: 2
      },
      {
        step_name: 'Manager Review',
        condition: 'amount <= 500',
        next_step_name: 'Process Payment',
        priority: 1
      },
      {
        step_name: 'Manager Review',
        condition: 'amount > 500',
        next_step_name: 'Finance Approval',
        priority: 2
      },
      {
        step_name: 'Finance Approval',
        condition: 'true',
        next_step_name: 'Process Payment',
        priority: 1
      },
      {
        step_name: 'Process Payment',
        condition: 'true',
        next_step_name: 'Notify Employee',
        priority: 1
      }
    ]
  },
  {
    name: 'Employee Onboarding Workflow',
    input_schema: {
      employee_name: { type: 'string', required: true },
      email: { type: 'string', required: true },
      department: { type: 'string', required: true },
      position: { type: 'string', required: true },
      start_date: { type: 'string', required: true },
      salary: { type: 'number', required: true },
      is_remote: { type: 'boolean', required: false }
    },
    steps: [
      {
        name: 'Create Employee Record',
        step_type: 'task',
        metadata: {
          instructions: 'HR creates employee record in HR system'
        }
      },
      {
        name: 'Setup Email Account',
        step_type: 'task',
        metadata: {
          instructions: 'IT creates email account and sends credentials'
        }
      },
      {
        name: 'Equipment Setup',
        step_type: 'task',
        metadata: {
          instructions: 'IT prepares laptop and other equipment'
        }
      },
      {
        name: 'Access Permissions',
        step_type: 'approval',
        metadata: {
          assignee_email: 'it-manager@company.com',
          instructions: 'Approve system access permissions'
        }
      },
      {
        name: 'Welcome Kit',
        step_type: 'task',
        metadata: {
          instructions: 'HR prepares welcome kit and documentation'
        }
      },
      {
        name: 'Schedule Orientation',
        step_type: 'task',
        metadata: {
          instructions: 'Schedule orientation and training sessions'
        }
      },
      {
        name: 'Send Welcome Email',
        step_type: 'notification',
        metadata: {
          notification_channel: 'email',
          instructions: 'Send welcome email with onboarding details'
        }
      }
    ],
    rules: [
      {
        step_name: 'Create Employee Record',
        condition: 'true',
        next_step_name: 'Setup Email Account',
        priority: 1
      },
      {
        step_name: 'Setup Email Account',
        condition: 'true',
        next_step_name: 'Equipment Setup',
        priority: 1
      },
      {
        step_name: 'Equipment Setup',
        condition: 'is_remote == true',
        next_step_name: 'Access Permissions',
        priority: 1
      },
      {
        step_name: 'Equipment Setup',
        condition: 'is_remote == false',
        next_step_name: 'Welcome Kit',
        priority: 2
      },
      {
        step_name: 'Access Permissions',
        condition: 'true',
        next_step_name: 'Welcome Kit',
        priority: 1
      },
      {
        step_name: 'Welcome Kit',
        condition: 'true',
        next_step_name: 'Schedule Orientation',
        priority: 1
      },
      {
        step_name: 'Schedule Orientation',
        condition: 'true',
        next_step_name: 'Send Welcome Email',
        priority: 1
      }
    ]
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workflow_automation');
    console.log('Connected to MongoDB');

    await Workflow.deleteMany({});
    await Step.deleteMany({});
    await Rule.deleteMany({});
    console.log('Cleared existing data');

    for (const workflowData of sampleWorkflows) {
      const { steps, rules, ...workflowInfo } = workflowData;
      
      const workflow = new Workflow(workflowInfo);
      await workflow.save();
      
      console.log(`Created workflow: ${workflow.name}`);

      const createdSteps = [];
      for (let i = 0; i < steps.length; i++) {
        const stepData = {
          ...steps[i],
          workflow_id: workflow.id,
          order: i + 1
        };
        
        const step = new Step(stepData);
        await step.save();
        createdSteps.push(step);
        
        console.log(`  Created step: ${step.name}`);
      }

      workflow.start_step_id = createdSteps[0].id;
      await workflow.save();

      for (const ruleData of rules) {
        const step = createdSteps.find(s => s.name === ruleData.step_name);
        const nextStep = createdSteps.find(s => s.name === ruleData.next_step_name);
        
        if (step) {
          const rule = new Rule({
            step_id: step.id,
            condition: ruleData.condition,
            next_step_id: nextStep ? nextStep.id : null,
            priority: ruleData.priority,
            is_default: false
          });
          
          await rule.save();
          console.log(`  Created rule for ${step.name}: ${ruleData.condition}`);
        }
      }

      for (const step of createdSteps) {
        const existingRules = await Rule.find({ step_id: step.id });
        if (existingRules.length === 0) {
          const defaultRule = new Rule({
            step_id: step.id,
            condition: 'true',
            next_step_id: null,
            priority: 999,
            is_default: true
          });
          await defaultRule.save();
          console.log(`  Created default rule for ${step.name}`);
        }
      }
    }

    console.log('Database seeded successfully!');
    
    const workflows = await Workflow.find({});
    console.log('\nCreated workflows:');
    workflows.forEach(w => {
      console.log(`- ${w.name} (ID: ${w.id})`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
