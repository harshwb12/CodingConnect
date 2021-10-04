const express = require('express');
const router = express.Router({ mergeParams: true });
const Announcement = require('../models/annoucement');
const { isLoggedIn } = require('../middleware');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/expresserror');
const Group = require('../models/group');

router.get('/', isLoggedIn, catchAsync(async (req, res) => {
    const { id1 } = req.params;
    const grp = await Group.findById(id1);
    const anncmnt = await Announcement.find({}).populate('author').sort({ date: -1 });
    res.render('announcement/index', { grp, anncmnt });
}))

router.put('/:id2/not', isLoggedIn, catchAsync(async (req, res) => {
    const { "id1": grpId, "id2": userId } = req.params;
    const grp = await Group.findById(grpId);
    const user = await User.findById(userId);
    const ancm = user.anncCnt.find(({ id }) => id == grpId);
    ancm.not = 0;
    await user.save();
    res.redirect(`/group/${grpId}/announcement`);
}))

router.post('/', isLoggedIn, catchAsync(async (req, res) => {
    const anncmnt = new Announcement(req.body);
    const { id1 } = req.params;
    const grp = await Group.findById(id1).populate('cntUsers');
    anncmnt.author = req.user._id;
    grp.annc.push(anncmnt._id);
    const guser = grp.cntUsers;
    const guserl = guser.length;
    for (let i = 0; i < guserl; i++) {
        const ancm = guser[i].anncCnt.find(({ id }) => id == id1);
        ancm.not++;
        await guser[i].save();
    }
    await anncmnt.save();
    await grp.save();
    req.flash('success', 'Successfully made an announcement');
    res.redirect(`/group/${id1}/announcement`);
}))

router.put('/:id2', isLoggedIn, catchAsync(async (req, res) => {
    const { "id1": grpId, "id2": anncId } = req.params;
    const annc = await Announcement.findById(anncId);
    annc.description = req.body.description;
    annc.date = Date.now();
    await annc.save();
    req.flash('success', 'Successfully edited the announcement');
    res.redirect(`/group/${grpId}/announcement`);
}))

router.delete('/:id2', isLoggedIn, catchAsync(async (req, res) => {
    const { "id1": grpId, "id2": anncId } = req.params;
    const deletedAnnc = await Announcement.findByIdAndDelete(anncId);
    const grp = await Group.findById(grpId);
    const ind = grp.annc.indexOf(anncId);
    grp.annc.splice(ind, 1);
    await grp.save();
    req.flash('success', 'Successfully deleted the announcement');
    res.redirect(`/group/${grpId}/announcement`);
}))

module.exports = router;