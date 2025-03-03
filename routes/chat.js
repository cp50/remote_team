const express = require('express');
const router = express.Router();

// Render the chat page
router.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login'); // Redirect to login if the user is not logged in
    }
    res.render('chat', { user: req.session.user }); // Pass user data to the view
});

module.exports = router;
