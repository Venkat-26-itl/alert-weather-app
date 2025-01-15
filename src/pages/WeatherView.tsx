import React, { useState, useEffect } from "react";
import axios from "axios";
import _ from "lodash";
import { useAuth } from "../auth/app.auth";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

type Country = {
  name: string;
  lat: number;
  long: number;
};

type CountryWithWeather = Country & {
  temperature: number;
  description: string;
};

const WeatherView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [storedCountries, setStoredCountries] = useState<CountryWithWeather[]>(
    []
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const { authToken, userId, logout } = useAuth();

  const fetchStoredCountriesWithWeather = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/country/weather",
        { params: { userId } }
      );
      if (response.data.success) {
        const countriesWithWeather = response.data.data;
        setStoredCountries(countriesWithWeather);
      } else {
        console.error("Failed to fetch weather data:", response.data);
      }
    } catch (error) {
      console.error("Error fetching stored countries with weather:", error);
    }
  };

  const debouncedFetchCountries = _.debounce(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3001/country/search?q=${query}`
      );
      const countries = response.data;
      setSuggestions(countries);
    } catch (error) {
      console.error("Error fetching countries:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, 500);

  const handleCountrySelect = async (country: Country) => {
    try {
      await axios.post(
        "http://localhost:3001/country/create",
        {
          name: country.name,
          latitude: country.lat,
          longitude: country.long,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setSnackbarMessage(
        `Country ${country.name} has been saved successfully.`
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchStoredCountriesWithWeather();
      setSearchTerm("");
    } catch (error) {
      console.error("Error saving country:", error);
      setSnackbarMessage("Error saving country. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const toTitleCase = (str: string) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  useEffect(() => {
    debouncedFetchCountries(searchTerm);

    return () => {
      debouncedFetchCountries.cancel();
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchStoredCountriesWithWeather();

    const interval = setInterval(fetchStoredCountriesWithWeather, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center p-12 bg-gray-50 min-h-screen relative">
      <div
        onClick={handleLogout}
        className="absolute top-4 right-4 text-red-500 hover:text-red-600 font-medium cursor-pointer transition"
      >
        Logout
      </div>

      <h1 className="text-3xl font-semibold mb-8">Country Search</h1>
      <div className="relative w-96 mb-8">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter 3 letters for search"
          className="w-full p-3 border border-gray-300 rounded-lg text-lg"
        />
        {loading && (
          <p className="absolute top-12 left-3 text-sm text-gray-500">
            Loading...
          </p>
        )}
        {suggestions.length > 0 && (
          <ul className="absolute top-12 left-0 right-0 bg-white border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
            {suggestions.map((country) => (
              <li
                key={country.name}
                onClick={() => handleCountrySelect(country)}
                className="px-4 py-3 cursor-pointer hover:bg-gray-100"
              >
                {country.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <h2 className="text-2xl font-semibold mb-4">
        Saved Countries and Weather
      </h2>
      <ul className="space-y-4">
        {storedCountries.map((country) => (
          <div
            key={country.name}
            className="bg-white p-4 rounded-lg shadow-md w-96"
          >
            <h3 className="text-xl font-semibold">{country.name}</h3>
            <p className="text-gray-700">
              Temperature: {country.temperature}°C
            </p>
            <p className="text-gray-700">
              Description: {toTitleCase(country.description)}
            </p>
          </div>
        ))}
      </ul>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default WeatherView;
