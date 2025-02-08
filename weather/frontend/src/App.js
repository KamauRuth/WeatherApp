import React, { useState, useEffect } from "react";
import { getWeather, saveWeather, fetchSavedWeather, deleteWeather, updateWeather } from "./api";
import "./App.css";

const WeatherApp = () => {
    const [location, setLocation] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState([]);
    const [savedWeather, setSavedWeather] = useState([]);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        loadSavedWeather();
    }, []);

    // Fetch Weather Data
    const handleFetchWeather = async () => {
        if (!location || !startDate || !endDate) {
            alert("Please enter a location and select a valid date range.");
            return;
        }

        const data = await getWeather(location, startDate, endDate);
        if (data) {
            setWeatherData(data);
            setForecastData(data.data || []);
        }
    };

    // Save Weather Data
    const handleSaveWeather = async () => {
        if (!forecastData.length) {
            alert("No weather data to save!");
            return;
        }

        const success = await saveWeather(location, startDate, endDate, forecastData);
        if (success) {
            alert("Weather data saved!");
            loadSavedWeather();
        }
    };

    // Load Saved Weather Data
    const loadSavedWeather = async () => {
        const savedData = await fetchSavedWeather();
        setSavedWeather(savedData);
    };

    // Delete Weather Record
    const handleDeleteWeather = async (id) => {
        if (await deleteWeather(id)) {
            alert("Weather record deleted!");
            loadSavedWeather();
        }
    };

    // Update Weather Record
    const handleUpdateWeather = async () => {
        if (await updateWeather(editId, location, startDate, endDate, forecastData)) {
            alert("Weather record updated!");
            setEditId(null);
            loadSavedWeather();
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
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

            {editId ? (
                <button onClick={handleUpdateWeather}>Update Data</button>
            ) : (
                <>
                    <button onClick={handleFetchWeather}>Get Weather</button>
                    <button onClick={handleSaveWeather}>Save Data</button>
                </>
            )}

            {/* Display Current Weather */}
            {weatherData && weatherData.data?.length > 0 ? (
                <div className="weather-card">
                    <h3>
                        {weatherData.location}, {weatherData.country} ({weatherData.startDate} to {weatherData.endDate})
                    </h3>

                    {weatherData.data.map((dayEntry, index) => (
                        <div key={index} className="forecast-card">
                            <h4>Date: {dayEntry.date}</h4>

                            {dayEntry.day && (
                                <div className="day-forecast">
                                    <p><strong>Day ({dayEntry.day.time}):</strong></p>
                                    <p>Temperature: {dayEntry.day.temperature}°C</p>
                                    <p>Humidity: {dayEntry.day.humidity}%</p>
                                    <p>Wind Speed: {dayEntry.day.wind_speed} m/s</p>
                                    <p>Description: {dayEntry.day.description}</p>
                                    <img src={dayEntry.day.icon} alt="Weather icon" />
                                </div>
                            )}

                            {dayEntry.night && (
                                <div className="night-forecast">
                                    <p><strong>Night ({dayEntry.night.time}):</strong></p>
                                    <p>Temperature: {dayEntry.night.temperature}°C</p>
                                    <p>Humidity: {dayEntry.night.humidity}%</p>
                                    <p>Wind Speed: {dayEntry.night.wind_speed} m/s</p>
                                    <p>Description: {dayEntry.night.description}</p>
                                    <img src={dayEntry.night.icon} alt="Weather icon" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p>No weather data available. Try another date range.</p>
            )}

            {/* Display Saved Weather Data */}
            {savedWeather.length > 0 && (
                <div>
                    <h3>Saved Weather Data</h3>
                    {savedWeather.map((entry) => (
                        <div key={entry._id} className="saved-card">
                            <h4>{entry.location}, {entry.country}</h4>
                            <p>Stored on: {new Date(entry.createdAt).toLocaleString()}</p>
                            <button
                                onClick={() => {
                                    setEditId(entry._id);
                                    setLocation(entry.location);
                                    setStartDate(entry.startDate.split("T")[0]);
                                    setEndDate(entry.endDate.split("T")[0]);
                                }}
                            >
                                Edit
                            </button>
                            <button onClick={() => handleDeleteWeather(entry._id)}>Delete</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WeatherApp;
