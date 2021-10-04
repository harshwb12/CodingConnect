//const { string } = require('joi');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    stat: [
        {
            grpId: String,
            noPrbS: {
                type: Number,
                default: 0
            },
            prbSet: [{
                prbSetId: String,
                solvedPrb: Array
            }]
        }
    ],
    note: [{
        id: String,
        des: String
    }]
    ,
    anncCnt: [{
        id: String,
        not: Number
    }]
})

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);
