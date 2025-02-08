const mongoose = require("mongoose");

const weatherSchema = new mongoose.Schema({
    location: String,
    country: String,
    startDate: String,
    endDate: String,
    data: [
        {
            date: String,
            day: {
                temperature: Number,
                humidity: Number,
                wind_speed: Number,
                description: String,
                icon: String,
            },
            night: {
                temperature: Number,
                humidity: Number,
                wind_speed: Number,
                description: String,
                icon: String,
            },
        },
    ],
}, { timestamps: true });

const WeatherModel = mongoose.model("Weather", weatherSchema);

module.exports = WeatherModel;
