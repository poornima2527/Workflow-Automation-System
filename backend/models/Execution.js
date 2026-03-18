const mongoose = require('mongoose');

const stepLogSchema = new mongoose.Schema({
  step_name: {
    type: String,
    required: true
  },
  step_type: {
    type: String,
    required: true,
    enum: ['task', 'approval', 'notification']
  },
  evaluated_rules: [{
    condition: String,
    result: Boolean,
    next_step_id: String
  }],
  selected_next_step: {
    type: String,
    required: false
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_progress', 'completed', 'failed', 'canceled']
  },
  approver_id: {
    type: String,
    required: false
  },
  error_message: {
    type: String,
    required: false
  },
  started_at: {
    type: Date,
    required: true
  },
  ended_at: {
    type: Date,
    required: false
  }
});

const executionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => require('uuid').v4()
  },
  workflow_id: {
    type: String,
    required: true,
    ref: 'Workflow'
  },
  workflow_version: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_progress', 'completed', 'failed', 'canceled'],
    default: 'pending'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    default: {}
  },
  logs: [stepLogSchema],
  current_step_id: {
    type: String,
    required: false
  },
  retries: {
    type: Number,
    required: true,
    default: 0
  },
  max_retries: {
    type: Number,
    required: true,
    default: 3
  },
  triggered_by: {
    type: String,
    required: true,
    default: 'system'
  },
  started_at: {
    type: Date,
    default: Date.now
  },
  ended_at: {
    type: Date,
    required: false
  }
});

executionSchema.index({ id: 1 });
executionSchema.index({ workflow_id: 1 });
executionSchema.index({ status: 1 });
executionSchema.index({ started_at: -1 });

module.exports = mongoose.model('Execution', executionSchema);
