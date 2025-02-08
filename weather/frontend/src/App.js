import React, { useState, useEffect } from "react";
import axios from "axios";
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
        fetchSavedWeather();
    }, []);

    // Fetch Current Weather
    const fetchWeather = async () => {
        if (!location || !startDate || !endDate) {
            alert("Please enter a location and select a valid date range.");
            return;
        }

        try {
            console.log("Fetched Weather Data:", weatherData);

            const response = await axios.get(`http://localhost:5000/weather`, {
                params: { location, startDate, endDate },
            });
            setWeatherData(response.data);
            setForecastData(response.data.data); 
        } catch (error) {
            console.error("Error fetching weather:", error.response?.data || error.message);
        }
    };

    // Save Weather Data to Database
    const saveWeather = async () => {
        if (!forecastData || forecastData.length === 0) {
            alert("No weather data to save!");
            return;
        }

        try {
            await axios.post(`http://localhost:5000/weather`, {
                location,
                startDate,
                endDate,
                data: forecastData,
            });
            alert("Weather data saved!");
            fetchSavedWeather();
        } catch (error) {
            console.error("Error saving weather:", error.response?.data || error.message);
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
                startDate,
                endDate,
                data: forecastData, 
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
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

            {editId ? (
                <button onClick={updateWeather}>Update Data</button>
            ) : (
                <>
                    <button onClick={fetchWeather}>Get Weather</button>
                    <button onClick={saveWeather}>Save Data</button>
                </>
            )}

            {/* <button onClick={fetchSavedWeather}>Retrieve Saved Weather</button> */}

            {/* Display Current Weather */}
            {/* Display Current Weather */}
{weatherData && weatherData.data && weatherData.data.length > 0 ? (
    <div className="weather-card">
        <h3>
            {weatherData.location}, {weatherData.country} ({weatherData.startDate} to {weatherData.endDate})
        </h3>
        {/* Display Current Weather with Day & Night Forecast */}
{weatherData && weatherData.data && weatherData.data.length > 0 && (
    <div className="weather-card">
        <h3>
            {weatherData.location}, {weatherData.country}, {weatherData.startDate} to {weatherData.endDate}
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
)}

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
                            <button onClick={() => deleteWeather(entry._id)}>Delete</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WeatherApp;
