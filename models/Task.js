const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Link to user
    createdAt: { type: Date, default: Date.now }, // Timestamp
    reminderTime: { type: Date, default: null } // Ensure null if not set
});

module.exports = mongoose.model('Task', TaskSchema);
