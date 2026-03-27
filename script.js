// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    updateClock();
    fetchWeather();

    // Update clock every second
    setInterval(updateClock, 1000);

    // Update weather every 30 minutes
    setInterval(fetchWeather, 30 * 60 * 1000);
});

function updateClock() {
    const now = new Date();

    // Time
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}`;

    // Date
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    document.getElementById('date').textContent = now.toLocaleDateString('en-US', options);
}

const WEATHER_MAPPING = {
    0: { label: 'Clear Sky', icon: 'sun' },
    1: { label: 'Mainly Clear', icon: 'cloud-sun' },
    2: { label: 'Partly Cloudy', icon: 'cloud' },
    3: { label: 'Overcast', icon: 'clouds' },
    45: { label: 'Foggy', icon: 'haze' },
    48: { label: 'Rime Fog', icon: 'haze' },
    51: { label: 'Light Drizzle', icon: 'cloud-drizzle' },
    53: { label: 'Moderate Drizzle', icon: 'cloud-drizzle' },
    55: { label: 'Dense Drizzle', icon: 'cloud-drizzle' },
    56: { label: 'Light Freezing Drizzle', icon: 'cloud-snow' },
    57: { label: 'Dense Freezing Drizzle', icon: 'cloud-snow' },
    61: { label: 'Slight Rain', icon: 'cloud-rain' },
    63: { label: 'Moderate Rain', icon: 'cloud-rain' },
    65: { label: 'Heavy Rain', icon: 'cloud-rain' },
    66: { label: 'Light Freezing Rain', icon: 'cloud-snow' },
    67: { label: 'Heavy Freezing Rain', icon: 'cloud-snow' },
    71: { label: 'Slight Snow Fall', icon: 'snowflake' },
    73: { label: 'Moderate Snow Fall', icon: 'snowflake' },
    75: { label: 'Heavy Snow Fall', icon: 'snowflake' },
    77: { label: 'Snow Grains', icon: 'snowflake' },
    80: { label: 'Slight Rain Showers', icon: 'cloud-rain-wind' },
    81: { label: 'Moderate Rain Showers', icon: 'cloud-rain-wind' },
    82: { label: 'Violent Rain Showers', icon: 'cloud-rain-wind' },
    85: { label: 'Slight Snow Showers', icon: 'snowflake' },
    86: { label: 'Heavy Snow Showers', icon: 'snowflake' },
    95: { label: 'Thunderstorm', icon: 'cloud-lightning' },
    96: { label: 'Thunderstorm with Hail', icon: 'cloud-lightning-rain' },
    99: { label: 'Thunderstorm with Heavy Hail', icon: 'cloud-lightning-rain' }
};

async function fetchWeather() {
    const lat = 31.5204;
    const lon = 74.3587;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum&timezone=auto`;

    try {
        const response = await fetch(url, { cache: 'no-store' });
        const data = await response.json();

        updateUI(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

function updateUI(data) {
    const current = data.current;
    const daily = data.daily;

    // Current Weather
    document.getElementById('current-temp').textContent = `${Math.round(current.temperature_2m)}°`;

    const weatherInfo = WEATHER_MAPPING[current.weather_code] || { label: 'Unknown', icon: 'help-circle' };
    document.getElementById('weather-description').textContent = weatherInfo.label;

    // Main Icon Update
    const iconContainer = document.getElementById('current-icon-container');
    iconContainer.innerHTML = `<i data-lucide="${weatherInfo.icon}" id="main-weather-icon" class="icon-large"></i>`;

    // High / Low
    document.getElementById('temp-max').textContent = `${Math.round(daily.temperature_2m_max[0])}°`;
    document.getElementById('temp-min').textContent = `${Math.round(daily.temperature_2m_min[0])}°`;

    // Extra Details
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('wind-speed').textContent = `${current.wind_speed_10m} km/h`;
    document.getElementById('uv-index').textContent = daily.uv_index_max[0];
    document.getElementById('precipitation').textContent = `${daily.precipitation_sum[0]} mm`;

    // Sun Times
    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };
    document.getElementById('sunrise-time').textContent = formatTime(daily.sunrise[0]);
    document.getElementById('sunset-time').textContent = formatTime(daily.sunset[0]);

    // Forecast
    const forecastGrid = document.getElementById('forecast-grid');
    forecastGrid.innerHTML = '';

    for (let i = 1; i < 8; i++) {
        const date = new Date(daily.time[i]);
        const dayName = i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'long' });
        const code = daily.weather_code[i];
        const info = WEATHER_MAPPING[code] || { icon: 'help-circle' };

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <span class="forecast-day">${dayName}</span>
            <div class="forecast-weather">
                <i data-lucide="${info.icon}"></i>
            </div>
            <div class="forecast-temp">
                <span class="max">${Math.round(daily.temperature_2m_max[i])}°</span>
                <span class="min">${Math.round(daily.temperature_2m_min[i])}°</span>
            </div>
        `;
        forecastGrid.appendChild(forecastItem);
    }

    // Last Updated
    const now = new Date();
    document.getElementById('last-updated').textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Re-create icons
    lucide.createIcons();
}
