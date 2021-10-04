//const { string } = require('joi');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const prbsetSchema = new Schema({
    name: String,
    problink: [
        {
            url: String,
            isSolvedBy:
                [{
                    type: Schema.Types.ObjectId,
                    ref: 'User'
                }]
            ,
            isFavOf:
                [{
                    type: Schema.Types.ObjectId,
                    ref: 'User'
                }]

        }
    ],
    reslink: [{
        url: String
    }]
})

module.exports = mongoose.model('Problemset', prbsetSchema);