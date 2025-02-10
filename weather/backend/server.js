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


app.use(express.json());

const allowedOrigins = [
  "http://localhost:3000", // For local development
  "https://weatherapp-1-w5v9.onrender.com" // Deployed frontend
];

const corsOptions = {
  origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
      } else {
          callback(new Error("Not allowed by CORS"));
      }
  },
  credentials: true, // Allow cookies and authentication headers
};

app.use(cors(corsOptions));

app.use('/', searchRouter);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://weather-app-r4ic.vercel.app"); // Ensure no trailing slash
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  console.log("CORS Headers Set");
  next();
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
