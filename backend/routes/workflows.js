const express = require('express');
const router = express.Router();
const simpleAPI = require('../services/simpleApi');
const Step = require('../models/Step');
const workflowExecutor = require('../services/workflowExecutor');

router.post('/', async (req, res) => {
  try {
    const { name, input_schema, start_step_id } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const workflow = await simpleAPI.createWorkflow({
      name,
      input_schema: input_schema || {},
      start_step_id,
      version: 1,
      is_active: true
    });

    res.status(201).json(workflow);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    let workflows = await simpleAPI.getWorkflows();
    
    if (search) {
      workflows = workflows.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));
    }

    const total = workflows.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedWorkflows = workflows.slice(startIndex, endIndex);

    for (let workflow of paginatedWorkflows) {
      const steps = await simpleAPI.getSteps(workflow.id);
      workflow.step_count = steps.length;
    }

    res.json({
      workflows: paginatedWorkflows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const workflow = await simpleAPI.getWorkflow(req.params.id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const steps = await simpleAPI.getSteps(workflow.id);
    workflow.steps = steps;

    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, input_schema, start_step_id, is_active } = req.body;
    
    const workflow = await simpleAPI.updateWorkflow(req.params.id, {
      name,
      input_schema,
      start_step_id,
      is_active
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    workflow.version += 1;
    await simpleAPI.updateWorkflow(req.params.id, { version: workflow.version });

    res.json(workflow);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const workflow = await simpleAPI.getWorkflow(req.params.id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    await simpleAPI.deleteWorkflow(req.params.id);

    res.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:workflow_id/execute', async (req, res) => {
  try {
    const { data, triggered_by } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Input data is required' });
    }

    const execution = await simpleAPI.createExecution({
      workflow_id: req.params.workflow_id,
      workflow_version: 1,
      data,
      triggered_by: triggered_by || 'system',
      status: 'completed',
      logs: [],
      retries: 0
    });

    res.status(201).json(execution);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
