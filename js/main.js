localStorage.removeItem('coords');
localStorage.removeItem('fetched-profiles');

(function () {
    //console.log(localStorage.getItem('clientCoords'));
})();



function fetchData() {
    //HTML5 Fetch
    fetch('https://randomuser.me/api?results=10')
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            localStorage.setItem('fetched-profiles', JSON.stringify(myJson));
            validateFetch();
            getClientPosition();
        })



}

function getClientPosition(){
    if ("geolocation" in navigator) {
        if (localStorage.getItem('coords') == undefined) {
            navigator.geolocation.getCurrentPosition(function (pos) {
                let coordLon = pos.coords.longitude;
                let coordLat = pos.coords.latitude;
                console.log(coordLon);
                console.log(coordLat);
                localStorage.setItem('clientLon', coordLon);
                localStorage.setItem('clientLat', coordLat);
                console.log(localStorage.getItem('clientLon'));
                console.log(localStorage.getItem('clientLat'));
            });
        }
    } else {
        console.log("Geolocation request denied or not available");
    }
}

function validateFetch() {
    let fetchedArray = JSON.parse(localStorage.getItem('fetched-profiles'));
    let likeArray = JSON.parse(localStorage.getItem('likes'));
    let dislikeArray = JSON.parse(localStorage.getItem('dislikes'));
    let clear = true;
    for (let i = 0; i < fetchedArray.length; i++) {
        if (likeArray.includes(fetchedArray.results[i].login.uuid) || dislikeArray.includes(fetchedArray.results[i].login.uuid)) {
            break;
            clear = false;
            console.log('duplicate found');
            localStorage.removeItem('fetched-profiles');
            fetchData();

        }
    }
    if (clear) {
        nextProfile();
        DisplayLikesDislikes(true);
    }
}

document.querySelector('.like').addEventListener('click', function () {
    ClassifyProfile('like');

});
document.querySelector('.dislike').addEventListener('click', function () {
    ClassifyProfile('dislike');
});

let index = 0;
let currentProfile = '';
let displayLDindex = 0;

function nextProfile() {
    //De-stringify array from localStorage
    let array = JSON.parse(localStorage.getItem('fetched-profiles'));
    //store profile from array with current $index in $currentprofile
    currentProfile = array.results[index];
    displayProfile(currentProfile);
    //Update $index and re-execute fetchData() if>=9
    if (index >= 9) {
        index = 0;
        fetchData();
    } else {
        index++;
    }
}

function displayProfile(hooman) {
    //Generating elements
    document.querySelector('.data-container').innerHTML = '';
    document.querySelector('.data-container').innerHTML += '<h1>' + hooman.name.first + ' ' + hooman.name.last + '</h1>';
    document.querySelector('.data-container').innerHTML += '<div class="picture"></div>';
    document.querySelector('.picture').style.backgroundImage = 'url(' + hooman.picture.large + ')';
    document.querySelector('.data-container').innerHTML += '<h3>Age: ' + hooman.dob.age + '</h3>';
    document.querySelector('.data-container').innerHTML += '<h3>Address: ' + hooman.location.street + ',</h3>';
    document.querySelector('.data-container').innerHTML += '<h3>' + hooman.location.city + '</h3>';
    let targetLat = hooman.location.coordinates.latitude;
    let targetLon = hooman.location.coordinates.longitude;
    let clientLat = localStorage.getItem('clientLat');
    let clientLon = localStorage.getItem('clientLon');
    document.querySelector('.data-container').innerHTML += '<h3>' + getDistance(clientLat, clientLon, targetLat, targetLon) + '</h3>';
}

function ClassifyProfile(type) {
    if (type == 'like') {
        let likes = new Array();
        //De-stringifying liked profiles-array from localStorage except first like
        if (localStorage.getItem('likes') != null) {
            likes = JSON.parse(localStorage.getItem('likes'));
        }
        likes.push(currentProfile);
        //Stringifying and storing array $likes to localStorage
        localStorage.setItem('likes', JSON.stringify(likes));
        DisplayLikesDislikes();
        nextProfile();
    } else if (type == 'dislike') {
        let dislikes = new Array();
        //De-stringifying disliked profiles-array from localStorage except first dislike
        if (localStorage.getItem('dislikes') != null) {
            dislikes = JSON.parse(localStorage.getItem('dislikes'));
        }
        dislikes.push(currentProfile);
        //Stringifying and storing array $dislikes to localStorage
        localStorage.setItem('dislikes', JSON.stringify(dislikes));
        DisplayLikesDislikes();
        nextProfile();
    }
}

function DisplayLikesDislikes(init) {
    //Create $likes and set to de-stringified localstorage string likes
    let likes = JSON.parse(localStorage.getItem('likes'));
    //Loop through $likes and display
    document.querySelector('.likes-container').innerHTML = '';
    if (likes != null) {
        for (i = 0; i < likes.length; i++) {
            document.querySelector('.likes-container').innerHTML += '<h3 class="switchlist" id="l' + i + '">' + likes[i].name.first + ' ' + likes[i].name.last + '</h3>';
        }
        for (a = 0; a < likes.length; a++) {
            displayLDindex = a;
            document.querySelector('#l' + a).addEventListener('click', function () {
                SwitchList(event.target.getAttribute('id').substr(1), 'likes');
            });
        }
    }
    //Create $dislikes and set to de-stringified localstorage string likes
    let dislikes = JSON.parse(localStorage.getItem('dislikes'));
    //Loop through $dislikes and display
    document.querySelector('.dislikes-container').innerHTML = '';
    if (dislikes != null) {
        for (i = 0; i < dislikes.length; i++) {
            document.querySelector('.dislikes-container').innerHTML += '<h3 class="switchlist" id="d' + i + '">' + dislikes[i].name.first + ' ' + dislikes[i].name.last + '</h3>';
        }
        for (a = 0; a < dislikes.length; a++) {
            displayLDindex = a;
            document.querySelector('#d' + a).addEventListener('click', function () {
                SwitchList(event.target.getAttribute('id').substr(1), 'dislikes');
            });
        }
    }
}

function SwitchList(index, type) {
    let likes = JSON.parse(localStorage.getItem('likes'));
    let dislikes = JSON.parse(localStorage.getItem('dislikes'));
    console.log(index);
    console.log(likes[index]);
    if (type == 'likes') {
        dislikes.push(likes[index]);
        likes.splice(index, 1);
    } else {
        likes.push(dislikes[index]);
        dislikes.splice(index, 1);
    }
    localStorage.setItem('likes', JSON.stringify(likes));
    localStorage.setItem('dislikes', JSON.stringify(dislikes));
    DisplayLikesDislikes();
    addMarker();
}

fetchData();


function getDistance(clientLat, clientLon, targetLat, targetLon) {
    console.log(clientLat);
    console.log(clientLon);
    console.log(targetLat);
    console.log(targetLon);
    let radlat1 = Math.PI * clientLat / 180;
    let radlat2 = Math.PI * targetLat / 180;
    let theta = clientLon - targetLon;
    let radtheta = Math.PI * theta / 180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344;
    dist = Math.floor(dist) + 'km';
    return dist;
}