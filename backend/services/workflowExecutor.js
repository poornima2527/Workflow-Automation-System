const Workflow = require('../models/Workflow');
const Step = require('../models/Step');
const Rule = require('../models/Rule');
const Execution = require('../models/Execution');
const ruleEngine = require('./ruleEngine');

class WorkflowExecutor {
  async executeWorkflow(workflowId, inputData, triggeredBy = 'system') {
    try {
      const workflow = await Workflow.findOne({ id: workflowId, is_active: true });
      if (!workflow) {
        throw new Error('Workflow not found or inactive');
      }

      const execution = new Execution({
        workflow_id: workflowId,
        workflow_version: workflow.version,
        data: inputData,
        triggered_by: triggeredBy,
        current_step_id: workflow.start_step_id,
        status: 'in_progress'
      });

      await execution.save();

      const result = await this.processExecution(execution.id);
      return result;
    } catch (error) {
      console.error('Workflow execution error:', error);
      throw error;
    }
  }

  async processExecution(executionId) {
    const maxIterations = 100;
    let iterationCount = 0;

    while (iterationCount < maxIterations) {
      iterationCount++;

      const execution = await Execution.findOne({ id: executionId });
      if (!execution) {
        throw new Error('Execution not found');
      }

      if (execution.status === 'completed' || execution.status === 'failed' || execution.status === 'canceled') {
        return execution;
      }

      if (!execution.current_step_id) {
        execution.status = 'completed';
        execution.ended_at = new Date();
        await execution.save();
        return execution;
      }

      const stepResult = await this.executeStep(execution);
      
      if (ruleEngine.checkForInfiniteLoop(execution.logs)) {
        execution.status = 'failed';
        execution.ended_at = new Date();
        await execution.save();
        throw new Error('Infinite loop detected in workflow execution');
      }

      if (stepResult.status === 'failed') {
        execution.status = 'failed';
        execution.ended_at = new Date();
        await execution.save();
        return execution;
      }

      execution.current_step_id = stepResult.next_step_id;
      await execution.save();
    }

    const execution = await Execution.findOne({ id: executionId });
    execution.status = 'failed';
    execution.ended_at = new Date();
    await execution.save();
    throw new Error('Maximum iterations reached, possible infinite loop');
  }

  async executeStep(execution) {
    const step = await Step.findOne({ id: execution.current_step_id });
    if (!step) {
      throw new Error(`Step not found: ${execution.current_step_id}`);
    }

    const stepLog = {
      step_name: step.name,
      step_type: step.step_type,
      evaluated_rules: [],
      selected_next_step: null,
      status: 'in_progress',
      started_at: new Date()
    };

    try {
      switch (step.step_type) {
        case 'task':
          await this.executeTask(step, execution.data, stepLog);
          break;
        case 'approval':
          await this.executeApproval(step, execution.data, stepLog);
          break;
        case 'notification':
          await this.executeNotification(step, execution.data, stepLog);
          break;
        default:
          throw new Error(`Unknown step type: ${step.step_type}`);
      }

      const rules = await Rule.find({ step_id: step.id }).sort({ priority: 1 });
      const ruleResult = await ruleEngine.evaluateRules(rules, execution.data);

      stepLog.evaluated_rules = rules.map(rule => ({
        condition: rule.condition,
        result: ruleEngine.evaluateCondition(rule.condition, execution.data),
        next_step_id: rule.next_step_id
      }));

      if (ruleResult) {
        stepLog.selected_next_step = ruleResult.next_step_id;
      }

      stepLog.status = 'completed';
      stepLog.ended_at = new Date();

      execution.logs.push(stepLog);
      await execution.save();

      return {
        status: 'completed',
        next_step_id: ruleResult ? ruleResult.next_step_id : null
      };
    } catch (error) {
      stepLog.status = 'failed';
      stepLog.error_message = error.message;
      stepLog.ended_at = new Date();

      execution.logs.push(stepLog);
      await execution.save();

      return {
        status: 'failed',
        next_step_id: null
      };
    }
  }

  async executeTask(step, data, stepLog) {
    console.log(`Executing task: ${step.name}`);
    
    if (step.metadata && step.metadata.instructions) {
      console.log(`Instructions: ${step.metadata.instructions}`);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true };
  }

  async executeApproval(step, data, stepLog) {
    console.log(`Executing approval: ${step.name}`);
    
    if (step.metadata && step.metadata.assignee_email) {
      console.log(`Approval required from: ${step.metadata.assignee_email}`);
      stepLog.approver_id = step.metadata.assignee_email;
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return { success: true };
  }

  async executeNotification(step, data, stepLog) {
    console.log(`Executing notification: ${step.name}`);
    
    if (step.metadata && step.metadata.notification_channel) {
      console.log(`Notification channel: ${step.metadata.notification_channel}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true };
  }

  async cancelExecution(executionId) {
    const execution = await Execution.findOne({ id: executionId });
    if (!execution) {
      throw new Error('Execution not found');
    }

    if (execution.status === 'completed') {
      throw new Error('Cannot cancel completed execution');
    }

    execution.status = 'canceled';
    execution.ended_at = new Date();
    await execution.save();

    return execution;
  }

  async retryExecution(executionId) {
    const execution = await Execution.findOne({ id: executionId });
    if (!execution) {
      throw new Error('Execution not found');
    }

    if (execution.status !== 'failed') {
      throw new Error('Can only retry failed executions');
    }

    if (execution.retries >= execution.max_retries) {
      throw new Error('Maximum retries exceeded');
    }

    const lastLog = execution.logs[execution.logs.length - 1];
    if (lastLog && lastLog.status === 'failed') {
      execution.logs.pop();
    }

    execution.status = 'in_progress';
    execution.retries += 1;
    await execution.save();

    const result = await this.processExecution(executionId);
    return result;
  }
}

module.exports = new WorkflowExecutor();
