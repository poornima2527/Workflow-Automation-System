const express = require('express');
const router = express.Router();
const Rule = require('../models/Rule');
const Step = require('../models/Step');
const ruleEngine = require('../services/ruleEngine');

router.post('/steps/:step_id/rules', async (req, res) => {
  try {
    const { condition, next_step_id, priority, is_default } = req.body;

    if (!condition) {
      return res.status(400).json({ error: 'Condition is required' });
    }

    const step = await Step.findOne({ id: req.params.step_id });
    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }

    const validation = ruleEngine.validateCondition(condition);
    if (!validation.valid) {
      return res.status(400).json({ error: `Invalid condition: ${validation.error}` });
    }

    if (is_default) {
      await Rule.updateMany(
        { step_id: req.params.step_id },
        { is_default: false }
      );
    }

    const lastRule = await Rule.findOne({ step_id: req.params.step_id })
      .sort({ priority: -1 });

    const rule = new Rule({
      step_id: req.params.step_id,
      condition,
      next_step_id,
      priority: priority || (lastRule ? lastRule.priority + 1 : 1),
      is_default: is_default || false
    });

    await rule.save();
    res.status(201).json(rule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/steps/:step_id/rules', async (req, res) => {
  try {
    const step = await Step.findOne({ id: req.params.step_id });
    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }

    const rules = await Rule.find({ step_id: req.params.step_id })
      .sort({ priority: 1 });

    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/rules/:id', async (req, res) => {
  try {
    const { condition, next_step_id, priority, is_default } = req.body;
    
    const rule = await Rule.findOne({ id: req.params.id });
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    if (condition) {
      const validation = ruleEngine.validateCondition(condition);
      if (!validation.valid) {
        return res.status(400).json({ error: `Invalid condition: ${validation.error}` });
      }
      rule.condition = condition;
    }

    if (next_step_id !== undefined) rule.next_step_id = next_step_id;
    if (priority !== undefined) rule.priority = priority;

    if (is_default !== undefined && is_default) {
      await Rule.updateMany(
        { step_id: rule.step_id, id: { $ne: req.params.id } },
        { is_default: false }
      );
      rule.is_default = true;
    } else if (is_default !== undefined) {
      rule.is_default = false;
    }

    await rule.save();
    res.json(rule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/rules/:id', async (req, res) => {
  try {
    const rule = await Rule.findOne({ id: req.params.id });
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    await Rule.deleteOne({ id: req.params.id });

    res.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/validate-condition', async (req, res) => {
  try {
    const { condition } = req.body;

    if (!condition) {
      return res.status(400).json({ error: 'Condition is required' });
    }

    const validation = ruleEngine.validateCondition(condition);
    res.json(validation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
