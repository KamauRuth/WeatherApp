import React, { useState } from "react";
import axios from "axios";
import "./App.css"; // Import external CSS file for styling

const App = () => {
    const [city, setCity] = useState("");
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [error, setError] = useState("");

    // Fetch current weather
    const getWeather = async () => {
        setError("");
        setWeather(null);
        setForecast(null);

        if (!city) {
            setError("Please enter a city name.");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/weather?location=${city}`);
            setWeather(response.data);
        } catch (err) {
            setError("Failed to fetch weather data.");
        }
    };

    // Fetch 5-day forecast
    const getForecast = async () => {
        setError("");
        setWeather(null);
        setForecast(null);

        if (!city) {
            setError("Please enter a city name.");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/forecast?location=${city}`);
            setForecast(response.data);
        } catch (err) {
            setError("Failed to fetch forecast data.");
        }
    };

    return (
        <div className="container">
            <h1>Weather App</h1>
            <div className="search-box">
                <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city name"
                />
                <button onClick={getWeather}>Get Weather</button>
                <button onClick={getForecast}>Get 5-Day Forecast</button>
            </div>

            {error && <p className="error">{error}</p>}

            {weather && (
                <div className="weather-box">
                    <h2>{weather.city}, {weather.country}</h2>
                    <img src={weather.icon} alt="Weather Icon" />
                    <p>🌡 Temperature: {weather.temperature}°C</p>
                    <p>💧 Humidity: {weather.humidity}%</p>
                    <p>💨 Wind Speed: {weather.wind_speed} m/s</p>
                    <p>📜 {weather.description}</p>
                </div>
            )}

            {forecast && (
                <div className="forecast-box">
                    <h2>{forecast.city}, {forecast.country} - 5-Day Forecast</h2>
                    <div className="forecast-list">
                        {forecast.forecast.map((day, index) => (
                            <div key={index} className="forecast-day">
                                <h4>{day.date}</h4>
                                <img src={day.icon} alt="Weather Icon" />
                                <p>🌡 {day.temperature}°C</p>
                                <p>💧 {day.humidity}%</p>
                                <p>💨 {day.wind_speed} m/s</p>
                                <p>📜 {day.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
