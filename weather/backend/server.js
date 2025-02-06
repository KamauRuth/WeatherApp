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
