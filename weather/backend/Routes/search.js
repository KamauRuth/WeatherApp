const express = require("express");
const axios = require("axios"); 
const searchRouter = express.Router();
const Search = require ('../models/searchModel');


searchRouter.get('/weather', async (req, res) => {
    
    try {
        const { city, } = req.query;
        
        if (!city) {
            return res.status(400).json({ error: "City is required" });
        }

        const apiKey = process.env.OPENWEATHER_API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        const response = await axios.get(url);
        const weatherData = response.data;

    

        // Save search to MongoDB
        const newSearch = new Search({
            city: weatherData.name,
            temperature: weatherData.main.temp,
            description: weatherData.weather[0].description,
            country: weatherData.sys.country,
        });
        await newSearch.save();

        res.json(weatherData);
    } catch (error) {
        res.status(500).json({ error: "Error fetching weather data" });
    }
});

module.exports = searchRouter;