const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const isAuthenticated = require('./authMiddleware'); // Import authentication middleware

// Get all tasks for the logged-in user
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.session.user.id });
        res.render('tasks', { tasks, user: req.session.user });
    } catch (err) {
        res.status(500).send('Error fetching tasks: ' + err.message);
    }
});

// Add a new task with a reminder
router.post('/add', isAuthenticated, async (req, res) => {
    const { title, description, reminderTime } = req.body;
    try {
        const newTask = new Task({
            title,
            description,
            userId: req.session.user.id,
            reminderTime: reminderTime ? new Date(reminderTime) : null
        });

        await newTask.save();
        console.log("New Task Added:", newTask); // Debugging log
        res.redirect('/tasks');
    } catch (err) {
        console.error("Error adding task:", err);
        res.status(500).send('Error adding task: ' + err.message);
    }
});

// Mark a task as completed
router.post('/complete/:id', isAuthenticated, async (req, res) => {
    try {
        await Task.findByIdAndUpdate(req.params.id, { completed: true });
        res.redirect('/tasks');
    } catch (err) {
        res.status(500).send('Error completing task: ' + err.message);
    }
});

// Delete a task
router.post('/delete/:id', isAuthenticated, async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.redirect('/tasks');
    } catch (err) {
        res.status(500).send('Error deleting task: ' + err.message);
    }
});

module.exports = router;
