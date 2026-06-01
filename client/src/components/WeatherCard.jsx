import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CloudSun, Search, AlertCircle, Droplets, Thermometer, Wind } from 'lucide-react';

const WeatherCard = () => {
  const [city, setCity] = useState(() => {
    return localStorage.getItem('last_weather_city') || 'London';
  });
  const [inputVal, setInputVal] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (cityToFetch) => {
    if (!cityToFetch.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/dashboard/weather?city=${cityToFetch}`);
      if (response.data.success) {
        setWeather(response.data.data);
        localStorage.setItem('last_weather_city', response.data.data.city || cityToFetch);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch weather.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city);
    setInputVal(city);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setCity(inputVal.trim());
      fetchWeather(inputVal.trim());
    }
  };

  return (
    <div className="dash-card card-weather">
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon-container">
            <CloudSun size={20} />
          </div>
          <span>Local Weather</span>
        </div>
      </div>

      <form onSubmit={handleSearch} className="card-input-wrapper">
        <input
          type="text"
          className="card-input"
          placeholder="Enter city (e.g. Seattle)"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn-card-action" disabled={loading} title="Get weather">
          <Search size={18} />
        </button>
      </form>

      {loading && (
        <div className="spinner-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Consulting meteorological satellites...</div>
        </div>
      )}

      {!loading && error && (
        <div className="card-error">
          <AlertCircle size={32} />
          <p className="card-error-msg">{error}</p>
          <button className="btn-retry" onClick={() => fetchWeather(city)}>
            Retry Fetch
          </button>
        </div>
      )}

      {!loading && !error && !weather && (
        <div className="weather-placeholder">
          <CloudSun size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>Search for a city to display weather</p>
        </div>
      )}

      {!loading && !error && weather && (
        <div className="weather-details-box">
          <div className="weather-city-name">
            {weather.city}
            {weather.isMock && (
              <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', marginLeft: '0.5rem', color: '#fbbf24', verticalAlign: 'middle' }}>
                Simulated
              </span>
            )}
          </div>
          
          <div className="weather-temp-row">
            <span className="weather-temp">{weather.temperature}°C</span>
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.description}
              className="weather-icon-img"
              onError={(e) => {
                // If OpenWeatherMap is blocked or down, fallback to generic styling
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div className="weather-desc">{weather.description}</div>

          <div className="weather-stats">
            <div className="weather-stat-pill">
              <div className="stat-label">
                <Droplets size={14} style={{ display: 'inline', marginRight: '0.25rem', color: '#38bdf8' }} />
                Humidity
              </div>
              <div className="stat-value">{weather.humidity}%</div>
            </div>
            
            <div className="weather-stat-pill">
              <div className="stat-label">
                <Thermometer size={14} style={{ display: 'inline', marginRight: '0.25rem', color: '#f59e0b' }} />
                Sensations
              </div>
              <div className="stat-value">
                {weather.temperature > 25 ? 'Warm' : weather.temperature > 15 ? 'Moderate' : 'Cool'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
