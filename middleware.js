//const ExpressError = require('./utils/expresserror');
const Group = require('./models/group');
const User = require('./models/user');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
}




