const express = require('express');
const { v4: uuidV4 } = require('uuid');
const router = express.Router();

// Redirect to a unique room
router.get('/', (req, res) => {
    res.redirect(`/video/${uuidV4()}`);
});

// Render video chat page
router.get('/:room', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('video', { roomId: req.params.room, userId: req.session.user._id });
});

module.exports = router;