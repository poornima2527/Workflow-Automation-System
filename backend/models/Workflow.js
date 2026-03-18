const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => require('uuid').v4()
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  version: {
    type: Number,
    required: true,
    default: 1
  },
  is_active: {
    type: Boolean,
    required: true,
    default: true
  },
  input_schema: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    default: {}
  },
  start_step_id: {
    type: String,
    required: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

workflowSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

workflowSchema.index({ id: 1 });
workflowSchema.index({ name: 1 });

module.exports = mongoose.model('Workflow', workflowSchema);
