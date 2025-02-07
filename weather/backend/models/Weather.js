const mongoose = require("mongoose");

const WeatherSchema = new mongoose.Schema(
    {
        location: { type: String, required: true, trim: true }, 
        country: { type: String, required: true, trim: true },  

        data: [
            {
                date: { type: Date, required: true }, 
                temperature: { type: Number, required: true }, 
                humidity: { type: Number, required: true },   
                wind_speed: { type: Number, required: true },  
                description: { type: String, required: true }, 
                icon: { type: String, required: true } 
            }
        ]
    },
    { timestamps: true } 
);

const WeatherModel = mongoose.model("Weather", WeatherSchema);
module.exports = WeatherModel;
