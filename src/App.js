import React, { useState, useEffect } from "react";
import "./App.css";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

const API_KEY = "WEATHER_API_KEY";
const LOCAL_STORAGE_KEY = "weatherSearchHistory";

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    }
  }, [history]);

  const handleSearch = async () => {
    if (!city) return;

    setError("");
    setWeatherData(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
      );

      if (!response.ok) throw new Error("Not found");

      const data = await response.json();
      const newWeather = {
        city: data.name,
        country: data.sys.country,
        description: data.weather[0].description,
        temperature: [
          (data.main.temp_min - 273.15).toFixed(2),
          (data.main.temp_max - 273.15).toFixed(2),
        ],
        isCloud: data.weather[0].main === "Clouds",
        humidity: `${data.main.humidity}%`,
        time: new Date().toLocaleString(),
        timeOnly: new Date().toLocaleTimeString(),
      };

      const filteredHistory = history.filter(
        (entry) =>
          entry.city.toLowerCase() !== newWeather.city.toLowerCase() ||
          entry.country.toLowerCase() !== newWeather.country.toLowerCase()
      );

      const updatedHistory = [newWeather, ...filteredHistory];

      setWeatherData(newWeather);
      setHistory(updatedHistory);
      handleClear();
    } catch (err) {
      setError("Not found");
    }
  };

  const handleClear = () => {
    setCity("");
    setError("");
  };

  const handleReSearch = (entry) => {
    setCity(entry.city);
    handleSearch();
  };

  const handleDelete = (index) => {
    const updated = history.filter((_, i) => i !== index);
    setHistory(updated);
  };

  return (
    <div className="app-container">
      <div className="search-section">
        <input
          className="country-input"
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={handleSearch} className="search-button">
          <SearchOutlinedIcon />
        </button>
      </div>

      {error && <div className="error-box">Not found</div>}

      {weatherData && (
        <div className={`weather-card ${weatherData?.isCloud ? "cloud" : ""}`}>
          <div className="weather-info">
            Today's Weather
            <h1>
              {weatherData
                ? `${Math.round(weatherData.temperature[0])}°`
                : "26°"}
            </h1>
            <div className="weather-details">
              <p>
                H: {weatherData?.temperature[1]}° L:{" "}
                {weatherData?.temperature[0]}°
              </p>
              <p>
                <strong>
                  {weatherData?.city}, {weatherData?.country}
                </strong>
              </p>
              <p>{weatherData?.time}</p>
            </div>
            <div className="weather-status">
              <p>{weatherData?.description}</p>
              <p>Humidity: {weatherData?.humidity}</p>
            </div>
          </div>
        </div>
      )}

      <div className="history-section">
        <h3>Search History</h3>
        <ul className="history-list">
          {history.map((entry, index) => (
            <li key={index}>
              <span>
                {entry.city}, {entry.country}
              </span>
              <div className="history-actions">
                <span>{entry.timeOnly}</span>
                <button onClick={() => handleReSearch(entry)}>
                  <SearchOutlinedIcon />
                </button>
                <button onClick={() => handleDelete(index)}>
                  <DeleteOutlineOutlinedIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
