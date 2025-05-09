import React, { useState, useEffect } from "react";
import "./App.css";
import SearchIcon from "@mui/icons-material/Search";
import { Grid, Box } from "@mui/material";
import HistoryItem from "./HistoryItem/HistoryItem";
import CircularProgress from "@mui/material/CircularProgress";
import dayjs from "dayjs";

const API_KEY = "WEATHER_API_KEY";
const LOCAL_STORAGE_KEY = "weatherSearchHistory";

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
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
          (data.main.temp_min - 273.15).toFixed(0),
          (data.main.temp_max - 273.15).toFixed(0),
        ],
        isCloud: data.weather[0].main === "Clouds",
        humidity: `${data.main.humidity}%`,
        time: dayjs().format("DD-MM-YYYY hh:mma").toLowerCase(),
        timeOnly: dayjs().format("DD-MM-YYYY hh:mma").toLowerCase(),
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
    } finally {
      setIsLoading(false);
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

  const searchHistory = (history) => {
    return (
      <div className="history-section">
        <h3>Search History</h3>
        <ul className="history-list">
          {history.map((entry, index) => (
            <HistoryItem
              entry={entry}
              index={index}
              handleReSearch={handleReSearch}
              handleRemove={handleDelete}
            />
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="app-container">
      <Grid container>
        <Grid size={{ xs: 0, md: 2, lg: 3 }} />

        <Grid size={{ xs: 12, md: 8, lg: 6 }}>
          <div className="search-section">
            <input
              className="country-input"
              type="text"
              placeholder="Search"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button onClick={handleSearch} className="search-button">
              <SearchIcon />
            </button>
          </div>

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress size={200} />
            </Box>
          ) : null}

          {error && <div className="error-box">{error}</div>}
          <div className={`weather-card`}>
            {weatherData && (
              <div
                className={`weather-info  ${
                  weatherData?.isCloud ? "cloud" : ""
                }`}
              >
                Today's Weather
                <h1>
                  {weatherData
                    ? `${Math.round(weatherData.temperature[0])}°`
                    : "26°"}
                </h1>
                <div className="weather-details-group">
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
                  </div>
                  <div className="weather-status">
                    <p>{weatherData?.description}</p>
                    <p>Humidity: {weatherData?.humidity}</p>
                    <p>{weatherData?.time}</p>
                  </div>
                </div>
              </div>
            )}

            {searchHistory(history)}
          </div>
        </Grid>
        <Grid
          item
          size={{
            xs: 0,
            md: 2,
            lg: 3,
          }}
        />
      </Grid>
    </div>
  );
}

export default App;
