const apiKey = "92a76a09a521f40e970e466cfbdf2432";

const iconCurrentDay = {

    'Clear': 'bi-brightness-high-fill',
    'Clouds': 'bi-cloud-sun-fill',
    'Rain': 'bi-cloud-rain-fill',
    'Drizzle': 'bi-cloud-drizzle-fill',
    'Thunderstorm': 'bi-cloud-lightning-fill',
    'Snow': 'bi-snow',
    'Mist': 'bi-cloud-haze2-fill',
    'Smoke': 'bi-cloud-fog-fill',
    'Haze': 'bi-cloud-haze2-fill',
    'Dust': 'bi-water',
    'Fog':'bi-cloud-fog-fill',
    'Sand': 'bi-water',
    'Ash': 'bi-cloud-fog-fill',
    'Squall': 'clouds-fill',
    'Tornado': 'tornado'

}

const iconCurrentNight = {

    'Clear': 'bi-moon-fill',
    'Clouds': 'bi-cloud-moon-fill',
    'Rain': 'bi-cloud-rain-fill',
    'Drizzle': 'bi-cloud-drizzle-fill',
    'Thunderstorm': 'bi-cloud-lightning-fill',
    'Snow': 'bi-snow',
    'Mist': 'bi-cloud-haze2-fill',
    'Smoke': 'bi-cloud-fog-fill',
    'Haze': 'bi-cloud-haze2-fill',
    'Dust': 'bi-water',
    'Fog':'bi-cloud-fog-fill',
    'Sand': 'bi-water',
    'Ash': 'bi-cloud-fog-fill',
    'Squall': 'clouds-fill',
    'Tornado': 'tornado'

}

function verificare(elId, el){
    document.querySelector(elId).textContent = el;
}

async function action(oras) {

    let lat, lon;
    let iconSet;
    let isDay;
    let sunsetTime;
    let sunriseTime;

    localStorage.setItem('oras', oras);

    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${oras}&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
        if (data.length === 0) {
            document.querySelector('#eroare').innerHTML = 'Invalid city.';
            throw new Error('Invalid city');
        }
        lat = data[0].lat;
        lon = data[0].lon;

        return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
    })
    .then(response => response.json())
    .then(weatherExact=> {
        sunsetTime = weatherExact.sys.sunset;
        sunriseTime = weatherExact.sys.sunrise;
        const currentTime = Math.floor(Date.now() / 1000);

        isDay = !(sunsetTime < currentTime || currentTime < sunriseTime);
        iconSet = isDay ? iconCurrentDay : iconCurrentNight;

        const stringTempExacta = `${Math.round(weatherExact.main.temp)}°C`;
        const stringVremeExacta = `${weatherExact.weather[0].main}`;
        const stringUmiditate = `Humidity: ${weatherExact.main.humidity}%`;
        const stringVant = `Wind: ${weatherExact.wind.speed}m/s`;
        const iconExacta = `${iconSet[weatherExact.weather[0].main]}`;

        localStorage.setItem('stringTempExacta', stringTempExacta);
        localStorage.setItem('stringUmiditate', stringUmiditate);
        localStorage.setItem('stringVremeExacta', stringVremeExacta);
        localStorage.setItem('stringVant', stringVant);
        localStorage.setItem('iconExacta', iconExacta);

        return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
    })
    .then(response => response.json())
    .then(weatherData => {
        let delay1 = `${weatherData.city.timezone * 1000}`;
        let delay = weatherData.city.timezone * 1000;

        localStorage.setItem('delay1', delay1);

        let temperaturi = [];
        let ore = [];
        let timeFrame;
        let stringOre = [];
        let stringTemperaturi = [];
        let icoane = [];
        let changingTime;
        let zi = 0;

        for(let i = 0; i < 10; i++){
            timeFrame = weatherData.list[i].dt * 1000;
            ore[i] = new Date(delay + timeFrame).getUTCHours();
            temperaturi[i] = weatherData.list[i].main.temp;

            if(ore[i] == 0 || ore[i] == 23 || ore[i] == 22){
                zi++;
            }

            changingTime = Math.floor(timeFrame / 1000) - zi * (24 * 3600);

            isDay = !(sunsetTime < changingTime || changingTime < sunriseTime);
            iconSet = isDay ? iconCurrentDay : iconCurrentNight;

            stringOre[i] = `${ore[i]}:00`;
            stringTemperaturi[i] = `${Math.round(temperaturi[i])}°C`;
            icoane[i] = `${iconSet[weatherData.list[i].weather[0].main]}`;

            localStorage.setItem(`stringOre${i}`, stringOre[i]);
            localStorage.setItem(`stringTemperaturi${i}`, stringTemperaturi[i]);
            localStorage.setItem(`icoane${i}`, icoane[i]);
        }

        return fetch(`https://tile.openweathermap.org/map/clouds_new/5/9/14.png?appid=${apiKey}`);
    })
    .then(response => response.blob())
    .then(blob=> {
        var zoom = 13;

        localStorage.setItem('mapConfig', JSON.stringify({
            lat: lat,
            lon: lon,
            zoom: zoom
        }));

        if(window.location.href === window.location.origin + '/'){
            window.location.href = `${encodeURIComponent(oras)}/`;
        }
        else{
            window.location.href = `${window.location.origin}/${encodeURIComponent(oras)}`
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.querySelector('#eroare').innerHTML = 'Invalid city.';
    });

    return false;
}
