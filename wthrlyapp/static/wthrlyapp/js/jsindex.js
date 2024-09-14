async function actionHover(oras) {
    let lat, lon;
    let iconSet;
    let isDay;
    let sunsetTime;
    let sunriseTime;

    let orasID = oras.replace(/%20/g, '');

    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${oras}&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
        if (data.length === 0) {
            document.querySelector('#eroare').innerHTML = 'Invalid city.';

            return;
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

        let stringTempExacta = `${Math.round(weatherExact.main.temp)}°C`;
        let iconExacta = `${iconSet[weatherExact.weather[0].main]}`;

        verificare(`#stringTempExacta${orasID}`, stringTempExacta);
        if(iconExacta) {
            document.querySelector(`#iconExacta${orasID}`).className = iconExacta;
        }

    })
    .catch(error => {
        console.error('Error:', error);
        document.querySelector('#eroare').innerHTML = 'Invalid city.';
    });

    return false;
}

document.addEventListener('DOMContentLoaded', function(){

    document.querySelector('form').onsubmit = function(event){
        event.preventDefault();
        let oras = document.querySelector('#oras').value;
        oras = oras.toLowerCase();
        oras = oras.replace(/[^a-z'A-Z0-9\s]/g, '');
        action(oras);
    }

    document.querySelectorAll('.rectangle-wrapper').forEach(item => {
        item.onclick = function(event) {
            event.preventDefault();
            let oras = this.getAttribute('href').split('/').filter(Boolean).pop();
            action(oras)
        };

        item.onmouseover = function() {
            let oras = this.getAttribute('href').split('/').filter(Boolean).pop();
            actionHover(oras);
            let infoScurt = this.querySelector('.infoScurt');
            infoScurt.classList.add("active");

        };

        item.onmouseout = function() {
            let infoScurt = this.querySelector('.infoScurt');
            infoScurt.classList.remove("active");
        };
    })

});
