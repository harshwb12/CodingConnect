const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const Group = require('../models/group');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/expresserror');
const { isLoggedIn } = require('../middleware');

router.get('/register', (req, res) => {
    res.render('users/register');
})

router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = User({ email, username });
        const resUser = await User.register(user, password);
        req.login(resUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to CP4U');
            res.redirect('/home');
        })

    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/register');
    }
}))

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    //const redirectUrl = req.session.returnTo || '/';
    req.flash('success', 'Welcome back!');
    res.redirect('/mygroups');
})

router.get('/logout', isLoggedIn, (req, res) => {
    req.flash('success', 'GoodBye :)');
    req.logout();
    res.redirect('/');
})

router.get('/profile/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    const grp = await Group.find({});
    res.render('users/profile', { user, grp });
}))

module.exports = router;