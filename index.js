const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const notFound = document.querySelector(".notFound");


// To track the current open tab
let currentTab = userTab;
// used in fetch API call (key is required)
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
currentTab.classList.add("current-tab");

getfromSessionStorage();


// To switching between the tab
function switchTab(clickedTab){
    if(currentTab!=clickedTab){
        // current-tab style attribute is responsible for grey background of tab btn
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");
        // clicked on search Tab (since it is not active)
        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            // clicked on userTab(your weather)
            notFound.classList.remove("active");
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // checking current session have user location coordinate (already stored or not)
            getfromSessionStorage();
        }
    }
}

// adding listener to tabs user and search
userTab.addEventListener('click',()=>{
    switchTab(userTab);
});
searchTab.addEventListener('click',()=>{
    switchTab(searchTab);
});

// if coordinates stored then show the data
// otherwise show the grant access permission
function getfromSessionStorage(){
    // getting stored coordinates
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    // coordinates not stored
    if(!localCoordinates){
        // visible grant access permission window
        grantAccessContainer.classList.add("active");
    }
    else{
        const coordinates  = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}



// fetching the data from coordinates
async function fetchUserWeatherInfo(coordinates){
    const {lat,lon} = coordinates;
    // makes grant access container invisible
    grantAccessContainer.classList.remove("active");
    // makes loader visible
    loadingScreen.classList.add("active");

    // API CALL
    try{
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();

        if(data.cod !== 200) {
            throw data.message;
        }

        // REMOVING LOADER
        loadingScreen.classList.remove("active");
        //display the weather info of current location
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
        alert("FAILED TO LOAD DATA, TRY AGAIN");
    }
}

// displaying the weather information in user Info container
function renderWeatherInfo(weatherInfo){
    // firstly we have to fetch the element to update them
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");
    // adding values in UI elements after fetching from weatherInfo object
    //using optional chaining operator
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = weatherInfo?.clouds?.all;
}

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        alert("grant access to show location");
    }
}

function showPosition(position){
    const userCoordinates = {
        lat : position.coords.latitude,
        lon : position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
// adding listner to grantAccessButton
grantAccessButton.addEventListener("click",getLocation);


const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName ===""){
        alert("Please Enter any name to submit");
        return;
    }
    else{
        try {
            
            fetchSearchWeatherInfo(cityName);
        } catch (error) {
         alert(error)  ; 
        }
    }
});

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    notFound.classList.remove("active");

    try{
        // fetching weather information using city name
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        if(data.cod !== 200){
            throw data.message;
        }
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
        notFound.classList.add("active");
    }
}