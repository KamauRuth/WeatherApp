// 

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

// 🔹 GET CURRENT WEATHER
searchRouter.get("/weather", async (req, res) => {
    const { location, startDate, endDate } = req.query;

    if (!location || !startDate || !endDate) {
        return res.status(400).json({ error: "Location, start date, and end date are required." });
    }

    if (new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({ error: "Start date must be before end date." });
    }

    try {
        const response = await axios.get(
            `http://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        );

        // Grouping forecasts by day
        const forecastByDay = {};
        response.data.list.forEach((entry) => {
            const date = new Date(entry.dt_txt).toISOString().split("T")[0]; // Extract just the date
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

        res.json({ location, startDate, endDate, data: Object.values(forecastByDay) });
    } catch (error) {
        console.error("Error fetching weather data:", error.message);
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});


// // 🔹 GET 5-DAY WEATHER FORECAST
// searchRouter.get("/forecast", async (req, res) => {
//     const { location } = req.query;

//     if (!(await validateLocation(location))) {
//         return res.status(400).json({ error: "Invalid location" });
//     }

//     try {
//         const response = await axios.get(
//             `http://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
//         );

//         const city = response.data.city.name;
//         const country = response.data.city.country;

//         // Grouping forecasts by day
//         const forecastByDay = {};
//         response.data.list.forEach((entry) => {
//             const date = new Date(entry.dt_txt).toLocaleDateString();
//             if (!forecastByDay[date]) {
//                 forecastByDay[date] = {
//                     date,
//                     temperature: entry.main.temp,
//                     humidity: entry.main.humidity,
//                     wind_speed: entry.wind.speed,
//                     description: entry.weather[0].description,
//                     icon: `http://openweathermap.org/img/wn/${entry.weather[0].icon}.png`,
//                 };
//             }
//         });

//         const forecastArray = Object.values(forecastByDay);

//         res.json({ city, country, forecast: forecastArray });
//     } catch (error) {
//         console.error("Error fetching forecast data:", error.message);
//         res.status(500).json({ error: "Failed to fetch forecast data" });
//     }
// });

// 🔹 CREATE - Store Forecast Data in MongoDB
searchRouter.post("/weather", async (req, res) => {
    const { location, startDate , endDate} = req.body;
    console.log(req.body);
    


    // Validate location
    const country = await validateLocation(location);
    if (!country) {
        return res.status(400).json({ error: "Invalid location" });
    }

    try {
        // Fetch 5-day forecast
        const response = await axios.get(
            `http://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        );

        // Structure data
        const weatherData = response.data.list
            .filter((entry) => {
                const entryDate = new Date(entry.dt_txt);
                return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
            })
            .map((entry) => ({
                date: entry.dt_txt,
                temperature: entry.main.temp,
                humidity: entry.main.humidity,
                wind_speed: entry.wind.speed,
                description: entry.weather[0].description,
                icon: `https://openweathermap.org/img/wn/${entry.weather[0].icon}.png`,
            }));

        // Store in MongoDB
        const newWeather = new WeatherModel({ location, country, startDate, endDate, data: weatherData });
        await newWeather.save();

        res.json(newWeather);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});

// READ - Get Stored Weather Data
searchRouter.get("/saved-weather", async (req, res) => {
    try {
        const weatherRecords = await WeatherModel.find(); // Fetch all saved weather data
        if (weatherRecords.length === 0) {
            return res.status(404).json({ error: "No saved weather data found" });
        }
        res.json(weatherRecords);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve saved weather data" });
    }
});



// 🔹 UPDATE - Modify Stored Forecast Data
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

// 🔹 DELETE - Remove Weather Data from DB
searchRouter.delete("/weather/:id", async (req, res) => {
    try {
        await WeatherModel.findByIdAndDelete(req.params.id);
        res.json({ message: "Weather record deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete weather data" });
    }
});

module.exports = searchRouter;
