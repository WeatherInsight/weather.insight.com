const apiKey = "9516373fdbd38aaae91b5a0e47f90b1c"; 

// When the page loads, check for geolocation or use a default city.
window.onload = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      getWeatherByCoords(lat, lon);
    }, function (error) {
      console.error("Geolocation error:", error);
      getWeather("New York"); // Default city if geolocation fails
    });
  } else {
    console.warn("Geolocation not supported, using default city.");
    getWeather("New York"); // Default city if geolocation is not available
  }
};

// Get weather data by coordinates (lat, lon)
async function getWeatherByCoords(lat, lon) {
  try {
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    if (!weatherRes.ok) throw new Error("Failed to fetch current weather data.");
    const weatherData = await weatherRes.json();
    getWeather(weatherData.name); // Use the city name from the coordinates data.
  } catch (error) {
    console.error("Error fetching weather by coordinates:", error);
    document.getElementById("weatherInfo").innerHTML = "<p>Error loading weather data. Please check your API key or internet connection.</p>";
  }
}

// Get weather by city name (manual or auto-location)
async function getWeather(city) {
  try {
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );
    if (!currentRes.ok) throw new Error("Failed to fetch current weather data.");

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
    );
    if (!forecastRes.ok) throw new Error("Failed to fetch forecast data.");

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    const { lat, lon } = current.coord;

    // Fetch air quality data (AQI)
    const aqiRes = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );
    if (!aqiRes.ok) throw new Error("Failed to fetch air quality data.");
    const aqiData = await aqiRes.json();
    const aqi = aqiData.list[0].main.aqi;

    // AQI Labels and Icons
    let aqiLabel = { label: "Unknown", class: "aqi", icon: "❓" };
    if (aqi === 1) aqiLabel = { label: "Good", class: "aqi aqi-good", icon: "🌿" };
    else if (aqi === 2) aqiLabel = { label: "Fair", class: "aqi aqi-fair", icon: "😊" };
    else if (aqi === 3) aqiLabel = { label: "Moderate", class: "aqi aqi-moderate", icon: "😐" };
    else if (aqi === 4) aqiLabel = { label: "Poor", class: "aqi aqi-poor", icon: "😷" };
    else if (aqi === 5) aqiLabel = { label: "Very Poor", class: "aqi aqi-very-poor", icon: "🤢" };

    const iconCode = current.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    let html = `
      <h2>${current.name}, ${current.sys.country}</h2>
      <img src="${iconUrl}" alt="weather icon" />
      <p><strong>${current.weather[0].main}</strong></p>
      <p>Temperature: ${current.main.temp}°C</p>
      <p>Humidity: ${current.main.humidity}%</p>
      <p>Wind: ${(current.wind.speed * 3.6).toFixed(1)} km/h</p>
      <p><strong>Air Quality Index:</strong> 
        <span class="${aqiLabel.class}">${aqiLabel.icon} ${aqi} - ${aqiLabel.label}</span>
      </p>
      <h3>5-Day Forecast</h3>
    `;

    // Filter forecast data to show 12:00:00 of each day
    const dailyForecasts = forecast.list.filter(f => f.dt_txt.includes("12:00:00"));

    dailyForecasts.forEach(day => {
      const date = new Date(day.dt_txt).toLocaleDateString(undefined, {
        weekday: "short", month: "short", day: "numeric"
      });
      const dayIcon = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
      const windKmh = (day.wind.speed * 3.6).toFixed(1);

      html += `
        <div class="forecast-day">
          <strong>${date}</strong><br>
          <img src="${dayIcon}" alt="icon" width="50"><br>
          ${day.weather[0].main}<br>
          Temp: ${day.main.temp}°C<br>
          Wind: ${windKmh} km/h
        </div>
      `;
    });

    document.getElementById("weatherInfo").innerHTML = html;
  } catch (error) {
    console.error("Error fetching weather:", error);
    document.getElementById("weatherInfo").innerHTML = "<p>Error loading weather data. Please check your API key or internet connection.</p>";
  }
}

// Manual city search
function manualSearch() {
  const city = document.getElementById("cityInput").value.trim();
  if (city) getWeather(city);
}
