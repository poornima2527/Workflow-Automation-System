const mongoose = require('mongoose');
const workflowExecutor = require('../services/workflowExecutor');
require('dotenv').config();

const demoExecutions = [
  {
    workflowName: 'Expense Approval Workflow',
    testCases: [
      {
        name: 'Small Expense - Manager Approval Only',
        data: {
          amount: 250,
          department: 'IT',
          employee_name: 'John Doe',
          expense_type: 'Office',
          description: 'Office supplies'
        }
      },
      {
        name: 'Large Expense - Finance Approval Required',
        data: {
          amount: 2500,
          department: 'Sales',
          employee_name: 'Jane Smith',
          expense_type: 'Travel',
          description: 'Client meeting travel expenses'
        }
      },
      {
        name: 'Medium Expense - Manager Review',
        data: {
          amount: 750,
          department: 'Marketing',
          employee_name: 'Bob Johnson',
          expense_type: 'Meals',
          description: 'Team lunch for project celebration'
        }
      }
    ]
  },
  {
    workflowName: 'Employee Onboarding Workflow',
    testCases: [
      {
        name: 'Remote Employee Onboarding',
        data: {
          employee_name: 'Alice Wilson',
          email: 'alice.wilson@company.com',
          department: 'Engineering',
          position: 'Senior Developer',
          start_date: '2024-02-01',
          salary: 120000,
          is_remote: true
        }
      },
      {
        name: 'Office Employee Onboarding',
        data: {
          employee_name: 'Charlie Brown',
          email: 'charlie.brown@company.com',
          department: 'HR',
          position: 'HR Coordinator',
          start_date: '2024-02-15',
          salary: 65000,
          is_remote: false
        }
      }
    ]
  }
];

async function runDemoExecutions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workflow_automation');
    console.log('Connected to MongoDB\n');

    const Workflow = require('../models/Workflow');
    
    for (const demo of demoExecutions) {
      const workflow = await Workflow.findOne({ name: demo.workflowName });
      
      if (!workflow) {
        console.log(`Workflow not found: ${demo.workflowName}`);
        continue;
      }

      console.log(`\n=== ${demo.workflowName} ===\n`);
      
      for (const testCase of demo.testCases) {
        console.log(`Running: ${testCase.name}`);
        console.log('Input data:', JSON.stringify(testCase.data, null, 2));
        console.log('\nExecution started...');
        
        try {
          const execution = await workflowExecutor.executeWorkflow(
            workflow.id,
            testCase.data,
            'demo'
          );
          
          console.log(`\nExecution Status: ${execution.status.toUpperCase()}`);
          console.log(`Execution ID: ${execution.id}`);
          console.log(`Started: ${execution.started_at}`);
          if (execution.ended_at) {
            console.log(`Ended: ${execution.ended_at}`);
          }
          
          console.log('\nExecution Steps:');
          execution.logs.forEach((log, index) => {
            console.log(`\n${index + 1}. ${log.step_name} (${log.step_type})`);
            console.log(`   Status: ${log.status.toUpperCase()}`);
            console.log(`   Started: ${log.started_at}`);
            if (log.ended_at) {
              console.log(`   Ended: ${log.ended_at}`);
              const duration = new Date(log.ended_at) - new Date(log.started_at);
              console.log(`   Duration: ${duration}ms`);
            }
            
            if (log.evaluated_rules && log.evaluated_rules.length > 0) {
              console.log('   Rules Evaluated:');
              log.evaluated_rules.forEach(rule => {
                console.log(`     - ${rule.condition} → ${rule.result ? 'TRUE' : 'FALSE'}`);
              });
            }
            
            if (log.selected_next_step) {
              console.log(`   Next Step: ${log.selected_next_step}`);
            }
            
            if (log.error_message) {
              console.log(`   Error: ${log.error_message}`);
            }
          });
          
          console.log('\n' + '='.repeat(50));
          
        } catch (error) {
          console.error(`Error in execution: ${error.message}`);
        }
        
        console.log('');
      }
    }
    
    console.log('\nDemo executions completed!');
    
  } catch (error) {
    console.error('Error running demo executions:', error);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  runDemoExecutions();
}

module.exports = runDemoExecutions;
