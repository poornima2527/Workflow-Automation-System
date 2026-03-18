const express = require('express');
const router = express.Router();
const simpleAPI = require('../services/simpleApi');

// Get pending approvals for a user
router.get('/pending/:userId', async (req, res) => {
  try {
    const executions = await simpleAPI.getExecutions();
    const pendingApprovals = executions.filter(execution => {
      return execution.status === 'in_progress' && 
             execution.logs && 
             execution.logs.some(log => 
               log.step_type === 'approval' && 
               log.status === 'in_progress' &&
               log.approver_id === req.params.userId
             );
    });
    
    res.json(pendingApprovals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve a workflow step
router.post('/approve/:executionId', async (req, res) => {
  try {
    const { userId, comments } = req.body;
    const execution = await simpleAPI.getExecution(req.params.executionId);
    
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    // Find the current approval step
    const currentLog = execution.logs.find(log => 
      log.step_type === 'approval' && 
      log.status === 'in_progress'
    );

    if (!currentLog) {
      return res.status(400).json({ error: 'No pending approval step found' });
    }

    if (currentLog.approver_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to approve this step' });
    }

    // Update the approval log
    currentLog.status = 'completed';
    currentLog.ended_at = new Date().toISOString();
    currentLog.approval_action = 'approved';
    currentLog.approver_comments = comments;

    // Here you would typically continue workflow execution
    // For now, we'll mark the execution as completed
    const updatedExecution = await simpleAPI.updateExecution(req.params.executionId, {
      status: 'completed',
      ended_at: new Date().toISOString()
    });

    res.json(updatedExecution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject a workflow step
router.post('/reject/:executionId', async (req, res) => {
  try {
    const { userId, comments, reason } = req.body;
    const execution = await simpleAPI.getExecution(req.params.executionId);
    
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    // Find the current approval step
    const currentLog = execution.logs.find(log => 
      log.step_type === 'approval' && 
      log.status === 'in_progress'
    );

    if (!currentLog) {
      return res.status(400).json({ error: 'No pending approval step found' });
    }

    if (currentLog.approver_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to reject this step' });
    }

    // Update the approval log
    currentLog.status = 'failed';
    currentLog.ended_at = new Date().toISOString();
    currentLog.approval_action = 'rejected';
    currentLog.approver_comments = comments;
    currentLog.rejection_reason = reason;

    // Mark the execution as failed
    const updatedExecution = await simpleAPI.updateExecution(req.params.executionId, {
      status: 'failed',
      ended_at: new Date().toISOString()
    });

    res.json(updatedExecution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all approvals (for admin)
router.get('/', async (req, res) => {
  try {
    const executions = await simpleAPI.getExecutions();
    const allApprovals = executions.filter(execution => 
      execution.logs && 
      execution.logs.some(log => log.step_type === 'approval')
    );
    
    res.json(allApprovals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
