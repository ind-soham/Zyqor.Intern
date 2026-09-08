const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  budget: { type: Number, required: true },
  duration: { type: String, required: true },
  category: { type: String, required: true },
  skills: [{ type: String }],
  match: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);

