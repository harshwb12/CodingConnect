const express = require('express');
const router = express.Router({ mergeParams: true });
const Problemset = require('../models/problemset');
const User = require('../models/user');
const Group = require('../models/group');
const { isLoggedIn } = require('../middleware');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/expresserror');

router.get('/', isLoggedIn, catchAsync(async (req, res) => {
    const { id1 } = req.params;
    const user = await User.findById(req.user._id);
    const sol = user.stat.find(({ grpId }) => grpId === id1);
    const grp = await Group.findById(id1).populate('prb');
    res.render('problemset/index', { grp, sol });
}))

router.get('/:id2', isLoggedIn, catchAsync(async (req, res) => {
    const { "id1": grpId, "id2": prbId } = req.params;
    const grp = await Group.findById(grpId).populate('prb');
    const prbset = grp.prb.find(({ _id }) => _id == prbId);
    const info = await Problemset.findById(prbId).populate('problink.isSolvedBy');
    res.render('problemset/indprbset', { grp, prbset, info });
}))

router.post('/new', isLoggedIn, catchAsync(async (req, res) => {
    const { id1 } = req.params;
    const grp = await Group.findById(id1);
    const prbset = new Problemset(req.body);
    grp.prb.push(prbset);
    await prbset.save();
    await grp.save();
    req.flash('success', `successfully added ${prbset.name}`);
    res.redirect(`/group/${id1}/problemset`);
}))

router.post('/:id2', isLoggedIn, catchAsync(async (req, res) => {
    const { "id1": grpId, "id2": prbId } = req.params;
    const grp = await Group.findById(grpId).populate('prb');
    const prbset = grp.prb.find(({ _id }) => _id == prbId);
    prbset.problink.push(req.body);
    grp.totPrb++;
    await grp.save();
    await prbset.save();
    req.flash('success', 'successfully added problem ');
    res.redirect(`/group/${grpId}/problemset/${prbId}`);
}))

router.post('/:id2/:id3/check', isLoggedIn, catchAsync(async (req, res) => {
    const { "id1": ggrpId, "id3": problemId, "id2": setId } = req.params;
    const set = await Problemset.findById(setId);
    const prb = set.problink.find(({ _id }) => _id == problemId);
    prb.isSolvedBy.push(req.user);
    const user = await User.findById(req.user._id);
    const grpJ = user.stat.find(({ grpId }) => grpId === ggrpId);
    grpJ.noPrbS++;
    const prbset = grpJ.prbSet.find(({ prbSetId }) => prbSetId === setId);
    if (prbset) {
        prbset.solvedPrb.push(problemId);
    } else {
        grpJ.prbSet.push({
            prbSetId: setId,
            solvedPrb: [problemId]
        })

    }
    await user.save();
    await set.save();
    req.flash('success', "successfully saved problem's status");
    res.redirect(`/group/${ggrpId}/problemset/${setId}`);
}))

router.post('/:id2/:id3/uncheck', isLoggedIn, catchAsync(async (req, res) => {
    const { "id1": ggrpId, "id3": problemId, "id2": setId } = req.params;
    const set = await Problemset.findById(setId);
    const prb = set.problink.find(({ _id }) => _id == problemId);
    const ind = prb.isSolvedBy.indexOf(req.user);
    prb.isSolvedBy.splice(ind, 1);
    const user = await User.findById(req.user._id);
    const grpJ = user.stat.find(({ grpId }) => grpId === ggrpId);
    grpJ.noPrbS--;
    const prbset = grpJ.prbSet.find(({ prbSetId }) => prbSetId === setId);
    if (prbset) {
        const indsp = prbset.solvedPrb.indexOf(problemId);
        prbset.solvedPrb.splice(indsp, 1);
    }
    await user.save();
    await set.save();
    req.flash('success', "successfully saved problem's status");
    res.redirect(`/group/${ggrpId}/problemset/${setId}`);
}))

//fav

router.post('/:id2/:id3/star', isLoggedIn, catchAsync(async (req, res) => {
    const { "id1": grpId, "id3": problemId, "id2": setId } = req.params;
    const grp = await Group.findById(grpId).populate('prb');
    const prbset = grp.prb.find(({ _id }) => _id == setId);
    const prblem = prbset.problink.find(({ _id }) => _id == problemId);
    prblem.isFavOf.push(req.user);
    await prbset.save();
    req.flash('success', `successfully added to favourites`);
    res.redirect(`/group/${grpId}/problemset/${setId}`);
}))

router.delete('/:id2/:id3/unstar', isLoggedIn, catchAsync(async (req, res) => {
    const { "id1": grpId, "id3": problemId, "id2": setId } = req.params;
    const grp = await Group.findById(grpId).populate('prb');
    const prbset = grp.prb.find(({ _id }) => _id == setId);
    const prblem = prbset.problink.find(({ _id }) => _id == problemId);
    const ind = prblem.isFavOf.indexOf(req.user);
    prblem.isFavOf.splice(ind, 1);
    await prbset.save();
    req.flash('success', `successfully removed from favourites`);
    res.redirect(`/group/${grpId}/problemset/${setId}`);
}))

//note

router.post('/:id2/:id3/note', isLoggedIn, catchAsync(async (req, res) => {
    const { "id1": grpId, "id3": problemId, "id2": setId } = req.params;
    const user = await User.findById(req.user._id);
    user.note.push({
        id: problemId,
        des: req.body.note
    });
    await user.save();
    req.flash('success', `successfully added note`);
    res.redirect(`/group/${grpId}/problemset/${setId}`);
}))


router.put('/:id2/:id3/note', isLoggedIn, catchAsync(async (req, res) => {
    const { "id1": grpId, "id3": problemId, "id2": setId } = req.params;
    const user = await User.findById(req.user._id);
    const prb = user.note.find(({ id }) => id == problemId);
    prb.des = req.body.note;
    await user.save();
    req.flash('success', `successfully edited note`);
    res.redirect(`/group/${grpId}/problemset/${setId}`);
}))

//resoucre link

router.post('/:id2/src', isLoggedIn, catchAsync(async (req, res) => {
    const { "id1": grpId, "id2": prbsetId } = req.params;
    const prbset = await Problemset.findById(prbsetId);
    prbset.reslink.push(req.body);
    await prbset.save();
    req.flash('success', 'successfully added study resource');
    res.redirect(`/group/${grpId}/problemset/${prbsetId}`);
}))

router.put('/:id2/src/:id3', isLoggedIn, catchAsync(async (req, res) => {
    const { "id1": grpId, "id2": setId, "id3": srcId } = req.params;
    const set = await Problemset.findById(setId);
    const resL = set.reslink.find(({ _id }) => _id == srcId);
    resL.url = req.body.url;
    await set.save();
    req.flash('success', 'successfully edited the study resource');
    res.redirect(`/group/${grpId}/problemset/${setId}`);
}))

router.delete('/:id2/src/:id3', isLoggedIn, catchAsync(async (req, res) => {
    const { "id1": grpId, "id2": setId, "id3": srcId } = req.params;
    const set = await Problemset.findById(setId);
    const ind = set.reslink.indexOf(srcId);
    set.reslink.splice(ind, 1);
    await set.save();
    req.flash('success', 'successfully deleted the study resource');
    res.redirect(`/group/${grpId}/problemset/${setId}`);
}))

//edit

router.put('/:id2', isLoggedIn, catchAsync(async (req, res) => {
    const { "id1": grpId, "id2": setId } = req.params;
    const set = await Problemset.findById(setId);
    set.name = req.body.name;
    await set.save();
    req.flash('success', `successfully edited name`);
    res.redirect(`/group/${grpId}/problemset`);
}))

router.put('/:id2/:id3', isLoggedIn, catchAsync(async (req, res) => {
    const { "id1": grpId, "id2": setId, "id3": srcId } = req.params;
    const set = await Problemset.findById(setId);
    const prbl = set.problink.find(({ _id }) => _id == srcId);
    prbl.url = req.body.url;
    await set.save();
    req.flash('success', `successfully saved the changes`);
    res.redirect(`/group/${grpId}/problemset/${setId}`);
}))

module.exports = router;