const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: true,
    trim: true
  },
  step_type: {
    type: String,
    required: true,
    enum: ['task', 'approval', 'notification']
  },
  order: {
    type: Number,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    default: {}
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

stepSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

stepSchema.index({ id: 1 });
stepSchema.index({ workflow_id: 1 });
stepSchema.index({ workflow_id: 1, order: 1 });

module.exports = mongoose.model('Step', stepSchema);
