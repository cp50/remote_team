const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const authMiddleware = require('./authMiddleware'); // Ensure middleware is used to protect routes

// Route to view calendar
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Fetch events for the logged-in user
        const events = await Event.find({ createdBy: req.session.user.id }).sort({ date: 1 });

        // Pass events and user info to the view
        res.render('calendar', { 
            events, 
            user: req.session.user // Pass the user details to the view
        });
    } catch (err) {
        res.status(500).send('Error loading calendar: ' + err.message);
    }
});

// Route to add an event
router.post('/add', authMiddleware, async (req, res) => {
    const { title, description, date } = req.body;
    try {
        const event = new Event({
            title,
            description,
            date,
            createdBy: req.session.user.id, // Attach user ID to event
        });
        await event.save();
        res.redirect('/calendar'); // Redirect to the calendar page after adding
    } catch (err) {
        res.status(500).send('Error adding event: ' + err.message);
    }
});

// Route to delete an event
router.post('/delete/:id', authMiddleware, async (req, res) => {
    try {
        await Event.deleteOne({ _id: req.params.id, createdBy: req.session.user.id });
        res.redirect('/calendar'); // Redirect to the calendar after deletion
    } catch (err) {
        res.status(500).send('Error deleting event: ' + err.message);
    }
});

module.exports = router;
