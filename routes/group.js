const express = require('express');
const User = require('../models/user');
const Group = require('../models/group');
const router = express.Router({ mergeParams: true });
const { isLoggedIn } = require('../middleware');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/expresserror');

router.get('/home', isLoggedIn, (req, res) => {
    res.render('group/jocr');
})

router.get('/mygroups', isLoggedIn, catchAsync(async (req, res) => {
    const allGrp = await Group.find();
    const user = await User.findById(req.user._id);
    const us = user.stat;
    const grp = [];
    const len = allGrp.length;
    for (let i = 0; i < len; i++) {
        if (allGrp[i].cntUsers.indexOf(req.user._id) != -1) {
            grp.push(allGrp[i]);
        }
    }
    res.render('group/mygroup', { grp, us });
}))
router.get('/group/:id1/addadm', isLoggedIn, catchAsync(async (req, res) => {
    const { "id1": grpId } = req.params;
    const grp = await Group.findById(grpId);
    const grp2 = await Group.findById(grpId).populate('cntAdmins');
    const user = await User.findById(req.user.id);
    if (grp.cntAdmins.indexOf(user._id) == -1) {
        req.flash('error', "you don't have permission to access the page");
        res.redirect(`/group/${grpId}/problemset`);
    }
    res.render('group/grpadm', { grp, grp2 });
}))

router.post('/group/:id1/addadm', isLoggedIn, async (req, res) => {
    const { "id1": grpId } = req.params;
    const grp = await Group.findById(grpId);
    try {
        const user = await User.findById(req.body.id);
        if (grp.cntAdmins.indexOf(req.user._id) == -1) {
            req.flash('error', "you don't have permission to access the page");
            res.redirect(`/group/${grpId}/problemset`);
        }
        if (user && grp.cntAdmins.indexOf(user._id) != -1) {
            req.flash('error', `user with unique id ${req.body.id} is already an admin`);
            return res.redirect(`/group/${grpId}/addadm`);
        }
        grp.cntAdmins.push(user._id);
        await grp.save();
        req.flash('success', `successfully added ${user.username} as admin`);
        res.redirect(`/group/${grpId}/addadm`);
    }
    catch (err) {
        req.flash('error', 'No such user exists');
        res.redirect(`/group/${grpId}/addadm`);
    }
})

router.post('/join', isLoggedIn, catchAsync(async (req, res) => {
    try {
        const grp = await Group.findById(req.body.id);
        if (grp.cntUsers.indexOf(req.user._id) == -1) {
            grp.cntUsers.push(req.user);
            const user = await User.findById(req.user._id);
            user.stat.push({
                grpId: grp._id
            });
            user.anncCnt.push({
                id: grp._id,
                not: 0
            })
            await user.save();
            await grp.save();
            req.flash('success', 'Successfully added to the group');
            res.redirect('/mygroups');
        }
        else {
            req.flash('error', 'You are already in the group');
            res.redirect('/mygroups');
        }
    } catch (err) {
        if (err) {
            req.flash('error', 'No such group exists');
            res.redirect('/home');
        }
    }
}))

router.post('/create', isLoggedIn, catchAsync(async (req, res) => {
    try {
        const grp = new Group(req.body);
        grp.cntUsers.push(req.user);
        grp.cntAdmins.push(req.user);
        const user = await User.findById(req.user._id);
        user.stat.push({
            grpId: grp._id
        })
        user.anncCnt.push({
            id: grp._id,
            not: 0
        })
        await user.save();
        await grp.save();
        req.flash('success', 'Successfully made a group');
        res.redirect('/mygroups');
    } catch (err) {
        if (err) {
            console.log(err);
            req.flash('error', 'Group with such name exists');
            res.redirect('/home');
        }
    }
}))

router.put('/group/:id1', isLoggedIn, catchAsync(async (req, res) => {
    const { "id1": grpId } = req.params;
    const grp = await Group.findById(grpId);
    grp.name = req.body.name;
    grp.description = req.body.description;
    await grp.save();
    req.flash('success', 'Successfully saved the changes');
    res.redirect('/mygroups');
}))

module.exports = router;