function verificare(elId, el){
    document.querySelector(elId).textContent = el;
}

document.addEventListener('DOMContentLoaded', function(){

    document.querySelector('form').onsubmit = function(event){
        event.preventDefault();
        let oras = document.querySelector('#oras1').value;
        oras = oras.toLowerCase();
        oras = oras.replace(/[^a-z'A-Z0-9\s]/g, '');
        action(oras)
    }

    const stringTempExacta = localStorage.getItem('stringTempExacta');
    const stringUmiditate = localStorage.getItem('stringUmiditate');
    const stringVremeExacta = localStorage.getItem('stringVremeExacta');
    const stringVant = localStorage.getItem('stringVant');
    const iconExacta = localStorage.getItem('iconExacta');
    const stringOre = [];
    const stringTemperaturi = [];
    const icoane = [];
    const delay1 = localStorage.getItem('delay1');
    let delay = parseInt(delay1, 10);

    for(let i = 0; i < 10; i++){
        stringOre[i] = localStorage.getItem(`stringOre${i}`);
        stringTemperaturi[i] = localStorage.getItem(`stringTemperaturi${i}`);
        icoane[i] = localStorage.getItem(`icoane${i}`);
    }

    verificare('#stringTempExacta', stringTempExacta);
    verificare('#stringUmiditate', stringUmiditate);

    function updateTimeString(delay) {
        let utc = Date.now();
        let timp = new Date(utc + delay);
        let ora = timp.getUTCHours();
        let minut = timp.getUTCMinutes();
        console.log(minut);

        let stringOraExacta = minut <= 9 ? `${ora}:0${minut}` : `${ora}:${minut}`;

        verificare('#stringOraExacta', stringOraExacta);
    }

    updateTimeString(delay);

    setInterval(() => updateTimeString(delay), 1000);

    verificare('#stringVremeExacta', stringVremeExacta);
    verificare('#stringVant', stringVant);

    if(iconExacta) {
        document.querySelector('#iconExacta').className =iconExacta;
    }

    for(let i = 0; i < 10; i++){
        verificare(`#stringOre${i}`, stringOre[i]);
        verificare(`#stringTemperaturi${i}`,stringTemperaturi[i]);
        if(icoane[i]) {
            document.querySelector(`#icoane${i}`).className = icoane[i];
        }
    }

    document.querySelector('.scroll').addEventListener('wheel', function(event) {
        event.preventDefault();
        const scrollAmount = event.deltaY;
        document.querySelector('.scroll').scrollLeft += scrollAmount;
    });

    var mapConfig = JSON.parse(localStorage.getItem('mapConfig'));

    if (mapConfig) {
        var map = L.map('map').setView([mapConfig.lat, mapConfig.lon], mapConfig.zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        }).addTo(map);
        L.tileLayer('https://{s}.tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid=92a76a09a521f40e970e466cfbdf2432', {
            layer: 'precipitation'
        }).addTo(map);

        map.getContainer().style.filter = 'grayscale(70%)';
    }

    const butonFav = document.getElementById("butonFav");

    butonFav.addEventListener('click', function(event) {
        event.preventDefault();

        const form = document.getElementById('favForm');
        const formData = new FormData(form);

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': formData.get('csrfmiddlewaretoken')
            }
        })
        .then(response=> {
            if(response.ok) {
                window.location.reload();
            }
            else {
                console.error('Failed to toggle favorite');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });


});
