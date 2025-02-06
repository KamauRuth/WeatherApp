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
    const getWeather = async () => {
      setError("");
      setWeather(null);
  
      if (!city || typeof city !== "string") {
          setError("Please enter a valid city name.");
          return;
      }
  
      try {
          console.log("Fetching weather for:", city); // Debugging
          const response = await axios.get(`http://localhost:5000/weather?city=${encodeURIComponent(city)}`);
          setWeather(response.data);
      } catch (err) {
          setError("Failed to fetch weather data.");
      }
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

            {error && <p style={{ color: "red" }}>{error}</p>}
            {weather && (
                <div>
                    <h2>{weather.name}, {weather.sys.country}</h2>
                    <p>Temperature: {weather.main.temp}°C</p>
                    <p>Weather: {weather.weather[0].description}</p>
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
