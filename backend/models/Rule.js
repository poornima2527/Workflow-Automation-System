const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => require('uuid').v4()
  },
  step_id: {
    type: String,
    required: true,
    ref: 'Step'
  },
  condition: {
    type: String,
    required: true,
    trim: true
  },
  next_step_id: {
    type: String,
    required: false
  },
  priority: {
    type: Number,
    required: true,
    default: 1
  },
  is_default: {
    type: Boolean,
    required: true,
    default: false
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

ruleSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

ruleSchema.index({ id: 1 });
ruleSchema.index({ step_id: 1 });
ruleSchema.index({ step_id: 1, priority: 1 });

module.exports = mongoose.model('Rule', ruleSchema);
