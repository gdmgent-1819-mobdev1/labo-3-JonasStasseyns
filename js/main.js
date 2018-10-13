function fetchData() {
    //HTML5 Fetch
    fetch('https://randomuser.me/api?results=10')
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            localStorage.setItem('fetched-profiles', JSON.stringify(myJson));
            validateFetch();
        })
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

document.querySelector('.like').addEventListener('click', function(){
    ClassifyProfile('like');
    
});
document.querySelector('.dislike').addEventListener('click', function(){
    ClassifyProfile('dislike');
});

let index = 0;
let currentProfile = '';
let displayLDindex = 0;

function nextProfile(){
    //De-stringify array from localStorage
    let array = JSON.parse(localStorage.getItem('fetched-profiles'));
    //store profile from array with current $index in $currentprofile
    currentProfile = array.results[index];
    displayProfile(currentProfile);
    //Update $index and re-execute fetchData() if>=9
    if(index>=9){
        index=0;
        fetchData();
    }else{
        index++;
    }
}

function displayProfile(hooman){
    //Generating elements
    document.querySelector('.data-container').innerHTML = '';
    document.querySelector('.data-container').innerHTML += '<h1>' + hooman.name.first + ' ' + hooman.name.last + '</h1>';
    document.querySelector('.data-container').innerHTML += '<div class="picture"></div>';
    document.querySelector('.picture').style.backgroundImage = 'url(' + hooman.picture.large + ')';
    document.querySelector('.data-container').innerHTML += '<h3>Age: ' + hooman.dob.age + '</h3>';
    document.querySelector('.data-container').innerHTML += '<h3>Address: ' + hooman.location.street + ',</h3>';
    document.querySelector('.data-container').innerHTML += '<h3>' + hooman.location.city + '</h3>';
}

function ClassifyProfile(type){
    if(type=='like'){
        let likes = new Array();
        //De-stringifying liked profiles-array from localStorage except first like
        if(localStorage.getItem('likes') != null){
            likes = JSON.parse(localStorage.getItem('likes'));
        }
        likes.push(currentProfile);
        //Stringifying and storing array $likes to localStorage
        localStorage.setItem('likes', JSON.stringify(likes));
        DisplayLikesDislikes();
        nextProfile();
    }else if(type=='dislike'){
        let dislikes = new Array();
        //De-stringifying disliked profiles-array from localStorage except first dislike
        if(localStorage.getItem('dislikes') != null){
            dislikes = JSON.parse(localStorage.getItem('dislikes'));
        }
        dislikes.push(currentProfile);
        //Stringifying and storing array $dislikes to localStorage
        localStorage.setItem('dislikes', JSON.stringify(dislikes));
        DisplayLikesDislikes();
        nextProfile();
    }
}

function DisplayLikesDislikes(init){
    //Create $likes and set to de-stringified localstorage string likes
    let likes = JSON.parse(localStorage.getItem('likes'));
    //Loop through $likes and display
    document.querySelector('.likes-container').innerHTML = '';
    if(likes != null){
        for(i=0; i<likes.length;i++){
        document.querySelector('.likes-container').innerHTML += '<h3 class="switchlist" id="l' + i + '">' + likes[i].name.first + ' ' + likes[i].name.last + '</h3>';
        }
        for(a=0;a<likes.length;a++){
            displayLDindex = a;
            document.querySelector('#l' + a).addEventListener('click', function(){
                SwitchList(event.target.getAttribute('id').substr(1), 'likes');
            });
        }
    }
    //Create $dislikes and set to de-stringified localstorage string likes
    let dislikes = JSON.parse(localStorage.getItem('dislikes'));
    //Loop through $dislikes and display
    document.querySelector('.dislikes-container').innerHTML = '';
    if(dislikes != null){
        for(i=0; i<dislikes.length;i++){
        document.querySelector('.dislikes-container').innerHTML += '<h3 class="switchlist" id="d' + i + '">' + dislikes[i].name.first + ' ' + dislikes[i].name.last + '</h3>';
        }
        for(a=0;a<dislikes.length;a++){
            displayLDindex = a;
            document.querySelector('#d' + a).addEventListener('click', function(){
                SwitchList(event.target.getAttribute('id').substr(1), 'dislikes');
            });
        }
    }
    addMarker();
}

function SwitchList(index, type){
    let likes = JSON.parse(localStorage.getItem('likes'));
    let dislikes = JSON.parse(localStorage.getItem('dislikes'));
    console.log(index);
    console.log(likes[index]);
    if(type=='likes'){
        dislikes.push(likes[index]);
        likes.splice(index, 1);
    }else{
        likes.push(dislikes[index]);
        dislikes.splice(index, 1);
    }
    localStorage.setItem('likes', JSON.stringify(likes));
    localStorage.setItem('dislikes', JSON.stringify(dislikes));
    DisplayLikesDislikes();
    addMarker();
}

fetchData();

//GeoLocation
mapboxgl.accessToken = 'pk.eyJ1IjoiYXJ2ZWxsb24iLCJhIjoiY2puNG1zdWd4M2kzdjNrcXlleGtpazI2cCJ9.p7i1IOVRm40GP4qdK4JuGg';
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/streets-v10'
});

function addMarker(){
    let likes = JSON.parse(localStorage.getItem('likes'));
for(i=0;i<likes.length;i++){
    new mapboxgl.Marker().setLngLat([likes[i].location.coordinates.longitude, likes[i].location.coordinates.latitude]).addTo(map);
}
}