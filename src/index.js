const form = document.getElementById('weather-form');
const input = document.getElementById('city');
const output = document.getElementById('weather-output');
const wrapper = document.getElementById('weather-wrapper');
const clearBtn = document.getElementById('clear');
const celsiusBtn = document.getElementById('celsius');
const fahrenheitBtn = document.getElementById('fahrenheit');

const weatherDescriptions = {
    0: "Clear sky ☀️ / 🌕",
    1: "Mainly clear 🌤 / 🌙",
    2: "Partly cloudy ⛅ / ☁️🌙",
    3: "Overcast ☁️",
    45: "Foggy 🌫",
    48: "Freezing fog ❄️🌫",
    51: "Light drizzle 🌦",
    53: "Moderate drizzle 🌦",
    55: "Dense drizzle 🌧",
    56: "Freezing light drizzle ❄️🌧",
    57: "Freezing dense drizzle ❄️🌧",
    61: "Slight rain 🌧",
    63: "Moderate rain 🌧",
    65: "Heavy rain 🌧🌧",
    66: "Freezing rain ❄️🌧",
    67: "Freezing heavy rain ❄️🌧🌧",
    71: "Light snow 🌨",
    73: "Moderate snow 🌨❄️",
    75: "Heavy snow 🌨❄️❄️",
    77: "Snow grains ❄️",
    80: "Light rain showers 🌦",
    81: "Moderate showers 🌧",
    82: "Violent rain ⛈",
    85: "Light snow showers 🌨",
    86: "Heavy snow showers 🌨❄️",
    95: "Thunderstorm ⛈",
    96: "Storm with hail ⛈🌨",
    99: "Severe storm with hail ⛈❄️"
};

let isCelsius = true;
let currentTempC = null;
let currentWindKPH = null;
let currentWeatherCode = null;
let currentCity = null;

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = input.value.trim();
    if (!city) return;

    try {
        const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
        const geoData = await geo.json();
        const location = geoData.results[0];
        const lat = location.latitude;
        const lon = location.longitude;

        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        const weather = data.current_weather;

        currentCity = city;
        currentTempC = weather.temperature;
        currentWindKPH = weather.windspeed;
        currentWeatherCode = weather.weathercode;

        renderWeather();
        updateBackground(currentTempC);
    } catch (err) {
        console.error(err);
        output.innerHTML = `<p>Could not fetch weather data.</p>`;
    }
});

function renderWeather() {
    const tempF = (currentTempC * 9) / 5 + 32;
    const windMPH = currentWindKPH / 1.609;
  
    const displayTemp = isCelsius ? `${currentTempC.toFixed(1)}°C` : `${tempF.toFixed(1)}°F`;
    const displayWind = isCelsius ? `${currentWindKPH.toFixed(1)} km/h` : `${windMPH.toFixed(1)} mph`;
  
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 19;
  
    let description = weatherDescriptions[currentWeatherCode] || "Unknown Weather";
  
    if (isNight && currentWeatherCode === 0) description = "Clear sky 🌕";
    else if (isNight && currentWeatherCode === 1) description = "Mainly clear 🌙";
    else if (isNight && currentWeatherCode === 2) description = "Partly cloudy 🌙☁️";
  
    output.innerHTML = `
        <h2>${currentCity}</h2>
        <p><strong>${displayTemp}</strong></p>
        <p>Wind: ${displayWind}</p>
        <p>${description}</p>
    `;
}

function updateBackground(temp) {
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 19;

    if (isNight) {
        document.body.style.background = 'var(--night-bg)';
    } else if (temp > 30) {
        document.body.style.background = 'var(--hot-bg)';
    } else if (temp > 20) {
        document.body.style.background = 'var(--warm-bg)';
    } else {
        document.body.style.background = 'var(--cold-bg)';
    }
}

celsiusBtn.addEventListener('click', () => {
    if (!isCelsius) {
        isCelsius = true;
        celsiusBtn.classList.add('active');
        fahrenheitBtn.classList.remove('active');
        if (currentTempC !== null) renderWeather();
    }
});

fahrenheitBtn.addEventListener('click', () => {
    if (isCelsius) {
        isCelsius = false;
        fahrenheitBtn.classList.add('active');
        celsiusBtn.classList.remove('active');
        if (currentTempC !== null) renderWeather();
    }
});

clearBtn.addEventListener('click', () => {
    input.value = '';
    output.innerHTML = '<h2>Weather App</h2><p>Enter a city to get started</p>';
    currentTempC = null;
    currentCity = null;
    currentWindKPH = null;
    currentWeatherCode = null;
    document.body.style.background = 'var(--cold-bg)';
});