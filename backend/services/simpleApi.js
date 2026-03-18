const simpleDB = require('../config/simpleDb');

class SimpleAPI {
  async getWorkflows() {
    return await simpleDB.readFile('workflows.json');
  }

  async getWorkflow(id) {
    const workflows = await this.getWorkflows();
    return workflows.find(w => w.id === id);
  }

  async createWorkflow(data) {
    const workflows = await this.getWorkflows();
    const newWorkflow = {
      id: await simpleDB.getNextId(workflows),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    workflows.push(newWorkflow);
    await simpleDB.writeFile('workflows.json', workflows);
    return newWorkflow;
  }

  async updateWorkflow(id, data) {
    const workflows = await this.getWorkflows();
    const index = workflows.findIndex(w => w.id === id);
    if (index === -1) return null;
    
    workflows[index] = {
      ...workflows[index],
      ...data,
      updated_at: new Date().toISOString()
    };
    await simpleDB.writeFile('workflows.json', workflows);
    return workflows[index];
  }

  async deleteWorkflow(id) {
    const workflows = await this.getWorkflows();
    const filtered = workflows.filter(w => w.id !== id);
    await simpleDB.writeFile('workflows.json', filtered);
    return true;
  }

  async getSteps(workflowId) {
    const steps = await simpleDB.readFile('steps.json');
    return steps.filter(s => s.workflow_id === workflowId).sort((a, b) => a.order - b.order);
  }

  async createStep(workflowId, data) {
    const steps = await simpleDB.readFile('steps.json');
    const workflowSteps = steps.filter(s => s.workflow_id === workflowId);
    const newStep = {
      id: await simpleDB.getNextId(steps),
      workflow_id: workflowId,
      ...data,
      order: workflowSteps.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    steps.push(newStep);
    await simpleDB.writeFile('steps.json', steps);
    return newStep;
  }

  async updateStep(id, data) {
    const steps = await simpleDB.readFile('steps.json');
    const index = steps.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    steps[index] = {
      ...steps[index],
      ...data,
      updated_at: new Date().toISOString()
    };
    await simpleDB.writeFile('steps.json', steps);
    return steps[index];
  }

  async deleteStep(id) {
    const steps = await simpleDB.readFile('steps.json');
    const filtered = steps.filter(s => s.id !== id);
    await simpleDB.writeFile('steps.json', filtered);
    return true;
  }

  async getStep(id) {
    const steps = await simpleDB.readFile('steps.json');
    return steps.find(s => s.id === id);
  }

  async getRules(stepId) {
    const rules = await simpleDB.readFile('rules.json');
    return rules.filter(r => r.step_id === stepId).sort((a, b) => a.priority - b.priority);
  }

  async createRule(stepId, data) {
    const rules = await simpleDB.readFile('rules.json');
    const stepRules = rules.filter(r => r.step_id === stepId);
    const newRule = {
      id: await simpleDB.getNextId(rules),
      step_id: stepId,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    rules.push(newRule);
    await simpleDB.writeFile('rules.json', rules);
    return newRule;
  }

  async updateRule(id, data) {
    const rules = await simpleDB.readFile('rules.json');
    const index = rules.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    rules[index] = {
      ...rules[index],
      ...data,
      updated_at: new Date().toISOString()
    };
    await simpleDB.writeFile('rules.json', rules);
    return rules[index];
  }

  async deleteRule(id) {
    const rules = await simpleDB.readFile('rules.json');
    const filtered = rules.filter(r => r.id !== id);
    await simpleDB.writeFile('rules.json', filtered);
    return true;
  }

  async getExecutions() {
    return await simpleDB.readFile('executions.json');
  }

  async getExecution(id) {
    const executions = await this.getExecutions();
    return executions.find(e => e.id === id);
  }

  async createExecution(data) {
    const executions = await this.getExecutions();
    const newExecution = {
      id: await simpleDB.getNextId(executions),
      ...data,
      started_at: new Date().toISOString()
    };
    executions.push(newExecution);
    await simpleDB.writeFile('executions.json', executions);
    return newExecution;
  }

  async updateExecution(id, data) {
    const executions = await this.getExecutions();
    const index = executions.findIndex(e => e.id === id);
    if (index === -1) return null;
    
    executions[index] = {
      ...executions[index],
      ...data
    };
    if (data.status === 'completed' || data.status === 'failed' || data.status === 'canceled') {
      executions[index].ended_at = new Date().toISOString();
    }
    await simpleDB.writeFile('executions.json', executions);
    return executions[index];
  }
}

module.exports = new SimpleAPI();
