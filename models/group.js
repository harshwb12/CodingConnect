const mongoose = require('mongoose');
const { Schema } = mongoose;// Schema = mongoose.Schema //destructur

const groupSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    description: String,
    cntUsers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    cntAdmins: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    prb: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Problemset'
        }
    ],
    totPrb: {
        type: Number,
        default: 0
    },
    annc: [{
        type: Schema.Types.ObjectId,
        ref: 'Anncmnt'
    }],
})

module.exports = mongoose.model('Group', groupSchema);