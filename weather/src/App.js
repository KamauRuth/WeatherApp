import React, { useState } from "react";
import axios from "axios";
import "./App.css"; // Import the external CSS file

const App = () => {
    const [city, setCity] = useState("");
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [error, setError] = useState("");

    // Function to get the current day's weather
    const getWeather = async () => {
        setError("");
        setWeather(null);
        setForecast(null); // Clear forecast when getting current weather

        if (!city.trim()) {
            setError("Please enter a valid city name.");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/weather?city=${encodeURIComponent(city)}`);
            if (response.data && response.data.main && response.data.weather) {
                setWeather(response.data);
            } else {
                setError("Invalid response format from API.");
            }
        } catch (err) {
            setError("Failed to fetch weather data.");
        }
    };

    // Function to get the 5-day forecast
    const getForecast = async () => {
        setError("");
        setWeather(null);
        setForecast(null); // Clear current weather when getting forecast

        if (!city.trim()) {
            setError("Please enter a valid city name.");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/forecast?city=${encodeURIComponent(city)}`);
            if (response.data && response.data.list) {
                setForecast(groupForecastByDay(response.data));
            } else {
                setError("Invalid forecast data format.");
            }
        } catch (err) {
            setError("Failed to fetch forecast data.");
        }
    };

    // Function to group forecast data by day
    const groupForecastByDay = (forecastData) => {
        const grouped = {};

        forecastData.list.forEach(item => {
            const date = new Date(item.dt_txt).toLocaleDateString();

            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(item);
        });

        // Extracting the first forecast of each day as a representative summary
        return Object.keys(grouped).map(date => ({
            date,
            forecast: grouped[date][0] // Using first entry for a general forecast
        }));
    };

    return (
        <div className="container">
            <h1>🌤️ Weather App</h1>

            <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name"
            />

            <div className="buttons">
                <button onClick={getWeather} className="btn-weather">Get Weather</button>
                <button onClick={getForecast} className="btn-forecast">Get 5-Day Forecast</button>
            </div>

            {error && <p className="error">{error}</p>}

            {/* Display Current Weather */}
            {weather && (
                <div className="current-weather">
                    <h2>{weather.name}, {weather.sys?.country}</h2>
                    <p>🌡️ Temperature: {weather.main.temp}°C</p>
                    <p>💧 Humidity: {weather.main.humidity}%</p>
                    <p>💨 Wind Speed: {weather.wind.speed} m/s</p>
                    <p>☁️ {weather.weather[0].description}</p>
                </div>
            )}

            {/* Display 5-Day Forecast */}
            {forecast && (
                <div className="forecast">
                    <h2>📅 5-Day Forecast for {city}</h2>
                    {forecast.map((day, index) => (
                        <div key={index} className="forecast-day">
                            <h4>{day.date}</h4>
                            <p>🌡️ Temperature: {day.forecast.main.temp}°C</p>
                            <p>☁️ {day.forecast.weather[0].description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default App;
