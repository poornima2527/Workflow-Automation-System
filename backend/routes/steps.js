const express = require('express');
const router = express.Router();
const simpleAPI = require('../services/simpleApi');

router.post('/workflows/:workflow_id/steps', async (req, res) => {
  try {
    const { name, step_type, metadata } = req.body;

    if (!name || !step_type) {
      return res.status(400).json({ error: 'Name and step_type are required' });
    }

    const workflow = await simpleAPI.getWorkflow(req.params.workflow_id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const step = await simpleAPI.createStep(req.params.workflow_id, {
      name,
      step_type,
      metadata: metadata || {}
    });

    res.status(201).json(step);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/workflows/:workflow_id/steps', async (req, res) => {
  try {
    const workflow = await simpleAPI.getWorkflow(req.params.workflow_id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const steps = await simpleAPI.getSteps(req.params.workflow_id);

    for (let step of steps) {
      const rules = await simpleAPI.getRules(step.id);
      step.rules = rules;
    }

    res.json(steps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/steps/:id', async (req, res) => {
  try {
    const { name, step_type, metadata, order } = req.body;
    
    const step = await simpleAPI.updateStep(req.params.id, {
      name,
      step_type,
      metadata,
      order
    });

    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }

    res.json(step);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/steps/:id', async (req, res) => {
  try {
    const step = await simpleAPI.getStep(req.params.id);
    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }

    await simpleAPI.deleteStep(req.params.id);

    res.json({ message: 'Step deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
