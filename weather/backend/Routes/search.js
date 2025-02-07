const express = require("express");
const axios = require("axios");
const searchRouter = express.Router();
const Search = require("../models/Weather.js");

// Function to validate date range
const isValidDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return !isNaN(start) && !isNaN(end) && start <= end;
};

// Function to validate location using OpenWeather API
const validateLocation = async (location) => {
    try {
        const response = await axios.get(
            `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}`
        );
        return !!response.data;
    } catch (error) {
        return false;
    }
};

// 🔹 GET CURRENT WEATHER
searchRouter.get("/weather", async (req, res) => {
    const { location } = req.query;

    if (!(await validateLocation(location))) {
        return res.status(400).json({ error: "Invalid location" });
    }

    try {
        const response = await axios.get(
            `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        );

        const data = response.data;

        const weatherInfo = {
            city: data.name,
            country: data.sys.country,
            temperature: data.main.temp,
            humidity: data.main.humidity,
            wind_speed: data.wind.speed,
            description: data.weather[0].description,
            icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`, // Weather icon
        };

        res.json(weatherInfo);
    } catch (error) {
        console.error("Error fetching weather data:", error.message);
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});

// 🔹 GET 5-DAY WEATHER FORECAST
searchRouter.get("/forecast", async (req, res) => {
    const { location } = req.query;

    if (!(await validateLocation(location))) {
        return res.status(400).json({ error: "Invalid location" });
    }

    try {
        const response = await axios.get(
            `http://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        );

        const city = response.data.city.name;
        const country = response.data.city.country;

        // Grouping forecasts by day
        const forecastByDay = {};
        response.data.list.forEach((entry) => {
            const date = new Date(entry.dt_txt).toLocaleDateString();
            if (!forecastByDay[date]) {
                forecastByDay[date] = {
                    date,
                    temperature: entry.main.temp,
                    humidity: entry.main.humidity,
                    wind_speed: entry.wind.speed,
                    description: entry.weather[0].description,
                    icon: `http://openweathermap.org/img/wn/${entry.weather[0].icon}.png`,
                };
            }
        });

        const forecastArray = Object.values(forecastByDay);

        res.json({ city, country, forecast: forecastArray });
    } catch (error) {
        console.error("Error fetching forecast data:", error.message);
        res.status(500).json({ error: "Failed to fetch forecast data" });
    }
});

module.exports = searchRouter;
