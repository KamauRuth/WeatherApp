const mongoose = require('mongoose');
const WeatherSchema = new mongoose.Schema({
    location: String,
    startDate: String,
    endDate: String,
    data: Array,
}, { timestamps: true });

const WeatherModel = mongoose.model("Weather", WeatherSchema);
module.exports = WeatherModel