const mongoose = require('mongoose');
const { Schema } = mongoose;

const anncmntSchema = new Schema({
    description: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    viewedBy: Number,
    date: { type: Date, default: Date.now },
    //     tz: 'Asia/Calcutta' // e.g. 
})

module.exports = mongoose.model('Anncmnt', anncmntSchema);

