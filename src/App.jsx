import { useEffect, useState, useCallback } from "react";
import { debounce } from "lodash";
import axios from "axios";
import { useSpring, animated } from "@react-spring/web";
import Card from "./components/Card.jsx";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import logo from '../src/assets/img/logo.png';
import Button from "./components/Button.jsx";
import ForecastChart from "./components/ForecastChart.jsx";
import toast, {Toaster} from 'react-hot-toast';
import Favorites from "./components/Favorites.jsx";
import { ExternalLink } from "./icons/ThemeIcons.jsx";
import { API_BASE, ERROR_MESSAGES } from "./config";

const App = () => {
  const apiKey = import.meta.env.VITE_OPEN_WEATHER_MAP_API_KEY;

  const [apiUrl, setApiUrl] = useState('');
  const [city, setCity] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [weatherIcon, setWeatherIcon] = useState('');
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // Loading
  const [isLoading, setIsLoading] = useState(false);

  // Errors
  const [error, setError] = useState('');

  // Suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggesions] = useState(false);

  const searchCity = async (query) => {
    try {
      const apiUrl = `${API_BASE}/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;
      const response = await axios.get(apiUrl);

      setSuggestions(response.data);
      setShowSuggesions(true);

    } catch (error) {
      console.log('Error fetching suggestions', error);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.length >= 2) {
        searchCity(query);
      }
      else {
        setSuggestions([]);
        setShowSuggesions(false);
      }
    }, 500),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCity(value);
    checkInput(value);
    debouncedSearch(value);
  };

  const checkInput = (e) => setError(e.length === 0 ? ERROR_MESSAGES.EMPTY : '');

  const findCity = async (selectedCity = null) => {
    const query = selectedCity || city;

    if (!query || query.length === 0) {
      setError(ERROR_MESSAGES.EMPTY);
      return;
    }

    if (!query || query.length < 2) {
      setError(ERROR_MESSAGES.SHORT)
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Main API call
      const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${apiKey}`;
      const response = await axios.get(apiUrl);

      if (!response || response.data.length === 0) {
        setError(ERROR_MESSAGES.NOT_FOUND);
        return;
      }

      setApiUrl(apiUrl);

      const cityDetails = response.data[0];
      const lat = cityDetails?.lat;
      const lon = cityDetails?.lon;

      // Get the mandatory data for the next API call
      setLat(lat);
      setLon(lon);

      const apiUrlWeather = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const apiUrlForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=it`;
      const weatherData = await axios.get(apiUrlWeather);
      const forecastData = await axios.get(apiUrlForecast);

      setCurrentWeather({
        'city'        : weatherData.data.name,
        'country'     : weatherData.data.sys.country,
        'weather'     : weatherData.data.weather[0]?.main,
        'icon'        : weatherData.data.weather[0]?.icon,
        'temperature' : weatherData.data.main?.temp,
        'feels_like'  : weatherData.data.main?.feels_like,
        'humidity'    : weatherData.data.main?.humidity
      });

      setWeatherIcon(`https://openweathermap.org/img/wn/${weatherData.data.weather[0].icon}.png`);

      // Reset the input
      setCity('');
      setSuggestions([]);
      setShowSuggesions(false);

      setForecastData(forecastData);

    } catch (error) {
      setError(ERROR_MESSAGES.GENERAL);
      console.log('API call error', error);
    } finally {
      setIsLoading(false);
    }
  }

  // 🔹 useEffect per la mappa
  useEffect(() => {
    if (lat && lon) {
      const map = L.map('map', {
        center: [lat, lon],
        zoom: 10
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const marker = L.marker([lat, lon]).addTo(map);

      if (currentWeather?.city) {
        marker.bindPopup(
          `
            <p>${currentWeather?.city}</p>
            <p>${currentWeather?.country}</p>
          `);
      }

      return () => map.remove();
    }
  }, [lat, lon, currentWeather]);

  // 🔹 useEffect per i preferiti
  useEffect(() => {
    const savedCities = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(savedCities);
  }, []);

  const addFavoriteCity = (city) => {
    if (!favorites.includes(city)) {
      const newFavorites = [...favorites, city];
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    }
    else {
      toast.custom(
        (t) => (
          <div
            className={`alert alert-error shadow-lg transition-opacity duration-1500 ${
              t.visible ? "opacity-100" : "opacity-0"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21
                   12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{city} is already in the favorites' list</span>
          </div>
        ),
        { duration: 2000 }
      );
    }
  }

  const removeCityFromFavorites = (city) => {
    const newFavorites = favorites.filter(c => c !== city);
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  }

  const [themeStyle, setThemeStyle] = useState('silk');

  const changeThemeStyle = () => {
    const newTheme = themeStyle === 'silk' ? 'dark' : 'silk';
    setThemeStyle(newTheme);
    document.querySelector('html').setAttribute('data-theme', newTheme);
  }

  // React Spring
  const fadeIn = useSpring({
    opacity: currentWeather ? 1 : 0,
    transform: currentWeather ? 'scale(1)' : 'scale(0.9)',
    config: { tension: 170, friction: 26}
  })

  return (
    <main className="bg-base-200 min-h-screen">
      <Toaster position="top-right" />
      <header className="flex justify-center action-elements py-10 px-8">
        <div className="logo w-[15%]">
          <img src={logo} className="max-w-[50px] h-auto mx-auto" alt="React Weather App - Andrea Novelli" />
        </div>
        <div className="hero w-[70%] mt-[-10px]">
          <div className="hero-content text-center pt-0">
            <div className="max-w-md">

              <h1 className="text-5xl font-bold">React Weather App</h1>
              <p className="py-6">
                The very classic Meteo App but always an evergreen!
              </p>
              <input
                type="text"
                placeholder="Insert a City"
                className="input"
                onChange={handleInputChange}
                onKeyDown={e => e.key === 'Enter' && findCity()}
                value={city}
                required
              />
              { error &&
                <div className="alert alert-error text-white justify-center text-xs p-1 w-[150px] mx-auto mt-3">
                  {error}
                </div>
              }
              {showSuggestions && suggestions.length > 0 && (
                <ul className="border mt-2 bg-white text-black">
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        setCity(s.name);
                        findCity(s.name);
                      }}
                    >
                      {s.name}, {s.country}
                    </li>
                  ))}
                </ul>
              )}
              <button
                className="btn btn-outline block w-25 mt-4 mx-auto"
                onClick={() => findCity()}
                disabled={isLoading}
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
              <Favorites
                favorites={favorites}
                onFindCity={findCity}
                onRemoveCityFromFavorites={removeCityFromFavorites}
              />

              {isLoading && (
                <div className="flex justify-center mt-4">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="actions w-[15%] text-center">
          <Button themeStyle={themeStyle} onToggleTheme={changeThemeStyle} />
        </div>
      </header>
      <section className="flex flex-wrap p-5">
        <div className="w-100 md:w-1/2 mb-8">
          { currentWeather && (
            <animated.div style={fadeIn}>
              <Card
                apiUrl={apiUrl}
                currentWeather={currentWeather}
                weatherIcon={weatherIcon}
                favorites={favorites}
                onAddFavorite={addFavoriteCity}
              />
            </animated.div>
          )}
        </div>

        {/* Leaflet map */}
        <div id="map" className="w-100 md:w-1/2 h-[500px]"></div>
      </section>
      <section className="px-4">
        <ForecastChart forecastData={forecastData} />
      </section>
      <footer className="text-center border-t p-4 mt-8">
        Powered by <a href="https://andreanovelli.dev" className="hover:underline" target="_blank"> Andrea Novelli <ExternalLink />
        </a>
      </footer>
    </main>
  );
}

export default App;
