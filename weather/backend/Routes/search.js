

const express = require("express");
const axios = require("axios");
const WeatherModel = require("../models/Weather.js");
require("dotenv").config();

const searchRouter = express.Router();

const validateDates = (startDate, endDate) => {
    if (!startDate || !endDate) {
        return "Both startDate and endDate are required.";
    }
}

const validateLocation = async (location) => {
    try {
        const response = await axios.get(
            `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}`
        );
        return response.data ? response.data.sys.country : false;
    } catch (error) {
        return false;
    }
};

// GET CURRENT WEATHER
searchRouter.get("/weather", async (req, res) => {
    try {
        const { location, startDate, endDate } = req.query;

        if (!location || !startDate || !endDate) {
            return res.status(400).json({ error: "Missing location or date range" });
        }

        console.log("Received Query:", { location, startDate, endDate });

        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        );

        if (!response.data || !response.data.list) {
            return res.status(404).json({ error: "No forecast data found" });
        }

        // Convert date strings to actual Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Filter and keep only two time slots per day: 12:00 PM (day) & 9:00 PM (night)
        const filteredForecast = {};
        response.data.list.forEach((entry) => {
            const entryDate = entry.dt_txt.split(" ")[0]; // Extract date (YYYY-MM-DD)
            const entryTime = entry.dt_txt.split(" ")[1]; // Extract time (HH:mm:ss)

            if (new Date(entryDate) >= start && new Date(entryDate) <= end) {
                if (!filteredForecast[entryDate]) {
                    filteredForecast[entryDate] = {};
                }

                if (entryTime === "12:00:00") {
                    filteredForecast[entryDate].day = entry;
                } else if (entryTime === "21:00:00") {
                    filteredForecast[entryDate].night = entry;
                }
            }
        });

        // Convert object to array format
        const forecastList = Object.keys(filteredForecast).map((date) => ({
            date,
            day: filteredForecast[date].day
                ? {
                      temperature: filteredForecast[date].day.main.temp,
                      humidity: filteredForecast[date].day.main.humidity,
                      wind_speed: filteredForecast[date].day.wind.speed,
                      description: filteredForecast[date].day.weather[0].description,
                      icon: `http://openweathermap.org/img/w/${filteredForecast[date].day.weather[0].icon}.png`,
                      time: "12:00 PM",
                  }
                : null,
            night: filteredForecast[date].night
                ? {
                      temperature: filteredForecast[date].night.main.temp,
                      humidity: filteredForecast[date].night.main.humidity,
                      wind_speed: filteredForecast[date].night.wind.speed,
                      description: filteredForecast[date].night.weather[0].description,
                      icon: `http://openweathermap.org/img/w/${filteredForecast[date].night.weather[0].icon}.png`,
                      time: "9:00 PM",
                  }
                : null,
        }));

        if (forecastList.length === 0) {
            return res.status(404).json({ error: "No weather data available for this date range." });
        }

        res.json({
            location: response.data.city.name,
            country: response.data.city.country,
            startDate,
            endDate,
            data: forecastList,
        });
    } catch (error) {
        console.error("Error fetching weather:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// READ - Get Stored Weather Data
searchRouter.get("/saved-weather", async (req, res) => {
    try {
        const weatherRecords = await WeatherModel.find(); 
        if (weatherRecords.length === 0) {
            return res.status(404).json({ error: "No saved weather data found" });
        }
        res.json(weatherRecords);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve saved weather data" });
    }
});

//STORE
searchRouter.post("/weather", async (req, res) => {
    try {
        const { location, country, startDate, endDate, data } = req.body;

        if (!location || !startDate || !endDate || !data) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newWeather = new WeatherModel({
            location,
            country,
            startDate,
            endDate,
            data,
        });

        await newWeather.save();
        res.status(201).json({ message: "Weather data saved successfully!" });
    } catch (error) {
        console.error("Error saving weather data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Retrieve Saved Weather Data
searchRouter.get("/saved-weather", async (req, res) => {
    try {
        const weatherData = await Weather.find().sort({ createdAt: -1 });
        res.json(weatherData);
    } catch (error) {
        console.error("Error retrieving weather data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



//  UPDATE - Modify Stored Forecast Data
searchRouter.put("/weather/:id", async (req, res) => {
    const { id } = req.params;
    const { location } = req.body;

    if (!(await validateLocation(location))) {
        return res.status(400).json({ error: "Invalid location" });
    }

    try {
        const updatedWeather = await WeatherModel.findByIdAndUpdate(
            id,
            { location },
            { new: true }
        );
        res.json(updatedWeather);
    } catch (error) {
        res.status(500).json({ error: "Failed to update weather data" });
    }
});

// DELETE - Remove Weather Data from DB
searchRouter.delete("/weather/:id", async (req, res) => {
    try {
        await WeatherModel.findByIdAndDelete(req.params.id);
        res.json({ message: "Weather record deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete weather data" });
    }
});

module.exports = searchRouter;
