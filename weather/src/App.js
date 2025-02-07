import React, { useState, useEffect } from "react";
import axios from "axios";
import './App.css'
const WeatherApp = () => {
    const [location, setLocation] = useState("");
    // const [startDate, setStartDate] = useState("");
    // const [endDate, setEndDate] = useState("");
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState([]);
    const [savedWeather, setSavedWeather] = useState([]);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchSavedWeather();
    }, []);

    // Fetch Current Weather
    const fetchWeather = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/weather`, {
                params: { location },
            });
            setWeatherData(response.data);
        } catch (error) {
            console.error("Error fetching weather:", error);
        }
    };

    // Fetch 5-Day Forecast
    const fetchForecast = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/forecast`, {
                params: { location },
            });
            setForecastData(response.data.forecast);
        } catch (error) {
            console.error("Error fetching forecast:", error);
        }
    };

    // Save Weather Data to Database
    const saveWeather = async () => {
        try {
            const response = await axios.post(`http://localhost:5000/weather`, {
                location,
                // startDate,
                // endDate,
                data: forecastData,
            });
            alert("Weather data saved!");
            fetchSavedWeather();
        } catch (error) {
            console.error("Error saving weather:", error);
        }
    };

    // Retrieve Stored Weather Data
    const fetchSavedWeather = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/saved-weather`);
            setSavedWeather(response.data);
        } catch (error) {
            console.error("Error retrieving saved weather:", error);
        }
    };

    // Delete Weather Record
    const deleteWeather = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/weather/${id}`);
            alert("Weather record deleted!");
            fetchSavedWeather();
        } catch (error) {
            console.error("Error deleting weather:", error);
        }
    };

    // Update Weather Record
    const updateWeather = async () => {
        try {
            await axios.put(`http://localhost:5000/weather/${editId}`, {
                location,
                // startDate,
                // endDate,
            });
            alert("Weather record updated!");
            setEditId(null);
            fetchSavedWeather();
        } catch (error) {
            console.error("Error updating weather:", error);
        }
    };

    return (
        <div className="weather-app">
            <h2>Weather Forecast App</h2>
            <input 
                type="text" 
                placeholder="Enter location" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
            />
            {/* <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
            />
            <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
            /> */}

            {editId ? (
                <button onClick={updateWeather}>Update Data</button>
            ) : (
                <>
                    <button onClick={fetchWeather}>Get Weather</button>
                    <button onClick={fetchForecast}>5-Day Forecast</button>
                    <button onClick={saveWeather}>Save Data</button>
                </>
            )}

            <button onClick={fetchSavedWeather}>Retrieve Saved Weather</button>

            {weatherData && (
                <div className="weather-card">
                    <h3>{weatherData.city}, {weatherData.country}</h3>
                    <p>Temperature: {weatherData.temperature}°C</p>
                    <p>Humidity: {weatherData.humidity}%</p>
                    <p>Wind Speed: {weatherData.wind_speed} m/s</p>
                    <p>Description: {weatherData.description}</p>
                    <img src={weatherData.icon} alt="Weather icon" />
                </div>
            )}

            {forecastData.length > 0 && (
                <div>
                    <h3>5-Day Forecast</h3>
                    {forecastData.map((day, index) => (
                        <div key={index} className="forecast-card">
                            <p>Date: {day.date}</p>
                            <p>Temp: {day.temperature}°C</p>
                            <p>Humidity: {day.humidity}%</p>
                            <p>Wind: {day.wind_speed} m/s</p>
                            <p>{day.description}</p>
                            <img src={day.icon} alt="Weather icon" />
                        </div>
                    ))}
                </div>
            )}

            {savedWeather.length > 0 && (
                <div>
                    <h3>Saved Weather Data</h3>
                    {savedWeather.map((entry) => (
                        <div key={entry._id} className="saved-card">
                            <h4>{entry.location}, {entry.country}</h4>
                            <p>Stored on: {new Date(entry.createdAt).toLocaleString()}</p>
                            <button onClick={() => {
                                setEditId(entry._id);
                                setLocation(entry.location);
                                // setStartDate(entry.startDate);
                                // setEndDate(entry.endDate);
                            }}>
                                Edit
                            </button>
                            <button onClick={() => deleteWeather(entry._id)}>Delete</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WeatherApp;
