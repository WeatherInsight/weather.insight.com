const apiKey = "0f0651dec40e7803a546551b49f0eb8e";

function getWeather() {
  const city = document.getElementById("cityInput").value;
  const weatherInfo = document.getElementById("weatherInfo");

  if (!city) {
    weatherInfo.innerHTML = `<p>Please enter a city name.</p>`;
    return;
  }

  const url = `https://cors-anywhere.herokuapp.com/https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then((data) => {
      const temperature = data.main.temp;
      const weather = data.weather[0].main;
      const cityName = data.name;
      const country = data.sys.country;

      weatherInfo.innerHTML = `
        <p><strong>Location:</strong> ${cityName}, ${country}</p>
        <p><strong>Temperature:</strong> ${temperature} °C</p>
        <p><strong>Condition:</strong> ${weather}</p>
      `;
    })
    .catch((error) => {
      weatherInfo.innerHTML = `<p>Error: ${error.message}</p>`;
    });
}
