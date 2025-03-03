const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import User model

// Middleware to protect routes that require authentication
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/auth/login');  // Redirect to login page if not authenticated
}

// Registration Route (GET and POST)
router.get('/register', (req, res) => {
    res.render('register'); // Render registration page
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.send('Username already exists.');
        }

        const user = new User({ username, password }); // Create new user
        await user.save();  // Save user in DB
        res.redirect('/auth/login');  // Redirect to login page after successful registration
    } catch (err) {
        res.send('Error registering user: ' + err.message);
    }
});

// Login Route (GET and POST)
router.get('/login', (req, res) => {
    res.render('login'); // Render login page
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.send('Invalid credentials');
        }

        // If login successful, create session
        req.session.user = { id: user._id, username: user.username };
        res.redirect('/auth/dashboard');  // Redirect to dashboard after successful login
    } catch (err) {
        res.status(500).send('Error logging in: ' + err.message);
    }
});

// Dashboard Route (protected)
router.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.session.user });  // Pass user info to the dashboard
});

// Logout Route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error logging out: ' + err.message);
        }
        res.redirect('/auth/login');  // Redirect to login page after logout
    });
});

module.exports = router;
