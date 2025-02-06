require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");

const dbConfig = require('./config/dbconfig.js');

const searchRouter = require('./Routes/search.js')

const app = express();
const PORT = process.env.PORT || 5000;
const cors_options = {
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  };

app.use(cors());
app.use(express.json());
app.use(cors(cors_options));
app.use('/', searchRouter);

// Define Search History Schema
// const searchSchema = new mongoose.Schema({
//     city: String,
//     temperature: Number,
//     description: String,
//     country: String,
//     timestamp: { type: Date, default: Date.now }
// });

// const Search = mongoose.model("Search", searchSchema);

// Fetch weather and save search history
// app.get("/weather", async (req, res) => {
//     try {
//         const { city, } = req.query;
//         if (!city) {
//             return res.status(400).json({ error: "City is required" });
//         }

//         const apiKey = process.env.OPENWEATHER_API_KEY;
//         const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

//         const response = await axios.get(url);
//         const weatherData = response.data;

//         // Save search to MongoDB
//         const newSearch = new Search({
//             city: weatherData.name,
//             temperature: weatherData.main.temp,
//             description: weatherData.weather[0].description,
//             country: weatherData.sys.country,
//         });
//         await newSearch.save();

//         res.json(weatherData);
//     } catch (error) {
//         res.status(500).json({ error: "Error fetching weather data" });
//     }
// });

// Fetch search history
// app.get("api/history", async (req, res) => {
//     try {
//         const history = await Search.find().sort({ timestamp: -1 }).limit(10);
//         res.json(history);
//     } catch (error) {
//         res.status(500).json({ error: "Error fetching search history" });
//     }
// });

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
