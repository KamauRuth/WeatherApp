const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
    city: {
        type: String,
    },

    temperature: {
        type: Number
    },
    description: {
        type: String
    },

    country: {
        type: String
    },

    timestamp: { 
        type: Date,
         default: Date.now 
        }
});

const searchModel = mongoose.model('Search', searchSchema);
module.exports = searchModel
