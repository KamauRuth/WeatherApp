import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
    const [city, setCity] = useState("");
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState("");
    const [history, setHistory] = useState([]);

    // Fetch search history
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get("http://localhost:5000/history");
                setHistory(response.data);
            } catch (err) {
                console.log("Failed to fetch history.");
            }
        };
        fetchHistory();
    }, [weather]); // Refresh history when weather updates

    // Fetch current weather
    const getWeather = async () => {
        setError("");
        setWeather(null);

        if (!city || typeof city !== "string") {
            setError("Please enter a valid city name.");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/weather?city=${encodeURIComponent(city)}`);
            setWeather(response.data);
        } catch (err) {
            setError("Failed to fetch weather data.");
        }
    };

    // Fetch 5-day forecast
    const getForecast = async () => {
        setError("");
        setWeather(null);

        if (!city || typeof city !== "string") {
            setError("Please enter a valid city name.");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/forecast?city=${encodeURIComponent(city)}`);
            setWeather(response.data);
        } catch (err) {
            setError("Failed to fetch forecast data.");
        }
    };

    // Group forecast data by day
    const groupForecastByDay = (forecastData) => {
        const grouped = {};

        // Loop through each forecast entry (3-hour interval)
        forecastData.list.forEach(item => {
            const date = new Date(item.dt_txt).toLocaleDateString(); // Get the date (ignores time)

            if (!grouped[date]) {
                grouped[date] = [];
            }

            grouped[date].push(item);
        });

        // Map each day to an object containing the date and a general forecast (first entry of the day)
        return Object.keys(grouped).map(date => ({
            date,
            forecast: grouped[date][0], // Use the first forecast data point of each day
        }));
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>Weather App</h1>
            <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name"
            />
            <button onClick={getWeather}>Get Weather</button>
            <button onClick={getForecast}>Get 5-Day Forecast</button>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {weather && (
                <div>
                    <h2>{weather.name}, {weather.sys?.country}</h2>

                    {/* Current Weather Section */}
                    {weather.main && (
                        <div>
                            <h3>Current Weather</h3>
                            <p><strong>Temperature:</strong> {weather.main.temp}°C</p>
                            <p><strong>Humidity:</strong> {weather.main.humidity}%</p>
                            <p><strong>Wind Speed:</strong> {weather.wind.speed} m/s</p>
                            <p><strong>Weather:</strong> {weather.weather[0].description}</p>
                        </div>
                    )}

                    {/* 5-Day Forecast Section */}
                    {weather.list && (
                        <div>
                            <h3>5-Day Forecast</h3>
                            {groupForecastByDay(weather).map((day, index) => (
                                <div key={index}>
                                    <h4>{day.date}</h4>
                                    <p>
                                        <strong>Temperature:</strong> {day.forecast.main.temp}°C, {day.forecast.weather[0].description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <h2>Search History</h2>
            <ul>
                {history.map((item, index) => (
                    <li key={index}>
                        {item.city}, {item.country} - {item.temperature}°C, {item.description}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;
