const express = require('express');
const router = express.Router();
const simpleAPI = require('../services/simpleApi');
const workflowExecutor = require('../services/workflowExecutor');

router.get('/:id', async (req, res) => {
  try {
    const execution = await simpleAPI.getExecution(req.params.id);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    res.json(execution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, workflow_id } = req.query;
    
    let executions = await simpleAPI.getExecutions();
    
    // Apply filters
    if (status) {
      executions = executions.filter(e => e.status === status);
    }
    if (workflow_id) {
      executions = executions.filter(e => e.workflow_id === workflow_id);
    }

    // Apply pagination
    const total = executions.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedExecutions = executions.slice(startIndex, endIndex);

    res.json({
      executions: paginatedExecutions,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/cancel', async (req, res) => {
  try {
    const execution = await simpleAPI.getExecution(req.params.id);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    if (execution.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed execution' });
    }

    const updatedExecution = await simpleAPI.updateExecution(req.params.id, {
      status: 'canceled',
      ended_at: new Date().toISOString()
    });

    res.json(updatedExecution);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/retry', async (req, res) => {
  try {
    const execution = await simpleAPI.getExecution(req.params.id);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    if (execution.status !== 'failed') {
      return res.status(400).json({ error: 'Can only retry failed executions' });
    }

    if (execution.retries >= 3) {
      return res.status(400).json({ error: 'Maximum retries exceeded' });
    }

    // Remove the last failed log if it exists
    if (execution.logs && execution.logs.length > 0) {
      const lastLog = execution.logs[execution.logs.length - 1];
      if (lastLog.status === 'failed') {
        execution.logs.pop();
      }
    }

    // Update execution for retry
    const updatedExecution = await simpleAPI.updateExecution(req.params.id, {
      status: 'in_progress',
      retries: execution.retries + 1,
      ended_at: null
    });

    res.json(updatedExecution);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
