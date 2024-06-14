document.addEventListener("DOMContentLoaded", function() {
    const cityInput = document.getElementById('city-input');
    const searchButton = document.getElementById('search-button');
    const description = document.getElementById('description');
    const temp = document.getElementById('temp');
    const hum = document.getElementById('hum');
    const feels = document.getElementById('feels');
    const clouds = document.getElementById('clouds');
    const wind = document.getElementById('wind');
    const pressure = document.getElementById('pressure');
    const precipitation = document.getElementById('precipitation');
    const weatherIcon = document.getElementById('weather-icon');
    const dayNight = document.getElementById('day-night');
    const airQuality = document.getElementById('air-quality');
    const error = document.getElementById('error');
    const weatherInfo = document.getElementById('weather-info');
    const boxContent = document.getElementById('box-content');
    const airQualityCircle = document.getElementById('circle-progress');
    const welcomeText = document.querySelector('.p1');
    const welcomeImage = document.querySelector('.i2');
    const nc = document.querySelector('.nc');

    const fetchWeather = async (city) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=2474b8cc0c5b3f5e81f823632bac443c`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            updateWeatherInfo(result);
            showAirQuality(result.coord.lat, result.coord.lon);
        } catch (error) {
            showError();
        }
    };

    const fetchAirQuality = async (lat, lon) => {
        const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=2474b8cc0c5b3f5e81f823632bac443c`;
        try {
            const response = await fetch(airQualityUrl);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            updateAirQuality(result.list[0].main.aqi);
        } catch (error) {
            airQuality.innerHTML = "N/A";
        }
    };

    const updateWeatherInfo = (result) => {
        description.innerHTML = result.weather[0].description;

        temp.innerHTML = result.main.temp + "°C";

        hum.innerHTML = `Humidity: <span class="number">${result.main.humidity}</span> %`;
        hum.className = "weather-detail humidity";

        feels.innerHTML = `Feels Like: <span class="number">${result.main.feels_like}</span> °C`;
        feels.className = "weather-detail feels-like";

        clouds.innerHTML = `Cloudiness: <span class="number">${result.clouds.all}</span> %`;
        clouds.className = "weather-detail cloudiness";

        let precipitationValue = 0;
        if (result.rain && result.rain['1h']) {
            precipitationValue = result.rain['1h'];
            precipitation.innerHTML = `Precipitation: <span class="number">${precipitationValue}</span> mm `;
        } else if (result.snow && result.snow['1h']) {
            precipitationValue = result.snow['1h'];
            precipitation.innerHTML = `Precipitation: <span class="number">${precipitationValue}</span> mm `;
        } else {
            precipitation.innerHTML = 'Precipitation: <span class="number">0</span> mm ';
        }
        precipitation.className = "weather-detail precipitation";

        const precipitationBar = document.getElementById('precipitation-bar');
        const maxPrecipitation = 1; // 1mm (maximum expected precipitation)
        const precipitationPercentage = Math.min((precipitationValue / maxPrecipitation) * 100, 100);
        precipitationBar.style.width = `${precipitationPercentage}%`;

        wind.innerHTML = `Wind: <span class="number">${result.wind.speed}</span> m/s, ${result.wind.deg}°`;
        wind.className = "weather-detail wind";

        pressure.innerHTML = `Pressure: <span class="number">${result.main.pressure}</span> hPa`;
        pressure.className = "weather-detail pressure";

        weatherIcon.src = "http://openweathermap.org/img/wn/" + result.weather[0].icon + "@2x.png";
        weatherIcon.style.display = "block";
        weatherIcon.className = "weather-icon";

        const isDaytime = (new Date().getTime() / 1000) > result.sys.sunrise && (new Date().getTime() / 1000) < result.sys.sunset;
        dayNight.innerHTML = isDaytime ? ".Day time" : ".Night";

        error.style.display = "none";
        weatherInfo.style.display = "block";
        welcomeText.style.display = "none";
        welcomeImage.style.display = "none";
        updateBackground(isDaytime, result.clouds.all, result.weather[0].main.toLowerCase());
        const textColor = isDaytime ? "black" : "white";

        // Apply text color to weather information
        description.style.color = textColor;
        temp.style.color = textColor;
        hum.style.color = textColor;
        feels.style.color = textColor;
        clouds.style.color = textColor;
        precipitation.style.color = textColor;
        wind.style.color = textColor;
        pressure.style.color = textColor;
        dayNight.style.color = textColor;
        nc.style.color = textColor;
    };

    const updateAirQuality = (aqi) => {
        const aqiText = ["Good", "Fair", "Moderate", "Poor", "Skint"];
        airQuality.innerHTML = aqiText[aqi - 1];
        airQuality.style.color = "white";
        airQuality.style.fontSize = "30px";
        airQuality.className = "n1";
        const percentage = (aqi / 5) * 100;
        airQualityCircle.style.strokeDasharray = `${percentage}, 100`;
        airQualityCircle.style.stroke = getAQIColor(aqi);
    };

    const updateBackground = (isDaytime, cloudiness, weatherCondition) => {
        document.body.className = '';
        if (isDaytime) {
            if (weatherCondition.includes('rain')) document.body.classList.add('sunny-rainy');
            else if (weatherCondition.includes('clear')) document.body.classList.add('sunny-clear');
            else if (weatherCondition.includes('haz')) document.body.classList.add('sunny-haze');
            else if (weatherCondition.includes('mis')) document.body.classList.add('sunny-clear');
            else if (weatherCondition.includes('clouds')) document.body.classList.add('sunny-overcast');
            else if (weatherCondition.includes('s'))document.body.classList.add('sunny-daytime');
        } else {
            if (weatherCondition.includes('rain')) document.body.classList.add('night-rainy');
            else if (weatherCondition.includes('clear')) document.body.classList.add('night-clear');
            else if (weatherCondition.includes('haze')) document.body.classList.add('night-haze');
            else if (weatherCondition.includes('mis')) document.body.classList.add('sunny-haze');
            else if (weatherCondition.includes('clouds')) document.body.classList.add('night-overcast');
            else if (weatherCondition.includes('s'))document.body.classList.add('night-normal');
        }
    };

    const showError = () => {
        error.style.display = "block";
        weatherInfo.style.display = "none";
        welcomeText.style.display = "block";
        welcomeImage.style.display = "block";
        document.body.className = 'default-weather';
    };

    const getAQIColor = (aqi) => {
        const colors = ['pink', 'pink', 'pink', 'pink', 'purple'];
        return colors[aqi - 1];
    };

    const showWeather = (city) => {
        fetchWeather(city);
    };

    const showAirQuality = (lat, lon) => {
        fetchAirQuality(lat, lon);
    };

    searchButton.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) showWeather(city);
    });

    cityInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) showWeather(city);
        }
    });
});

      
