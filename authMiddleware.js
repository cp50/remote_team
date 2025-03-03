// authMiddleware.js
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        next(); // User is authenticated
    } else {
        res.redirect('/auth/login'); // Redirect to login page if not authenticated
    }
}

module.exports = { isAuthenticated };
