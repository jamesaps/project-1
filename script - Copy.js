function fetchWeatherData(cityName) {
  var geoLocation = "http://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&limit=5&appid=61f330dba4f57ef74ff9bbf61009b929";
  fetch(geoLocation)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var cityLat = data[0].lat;
      var cityLon = data[0].lon;
      var cityWeather = "https://api.openweathermap.org/data/2.5/forecast?lat=" + cityLat + "&lon=" + cityLon + "&appid=61f330dba4f57ef74ff9bbf61009b929";
      fetch(cityWeather)
        .then(function (response) {
          return response.json();
        })
        .then(function (weather) {
          updateDOM(data, weather);
        })
    });
}
function updateDOM(data, weather) {
  $("#today").empty();
  $("#forecast").empty();

  // Info to display current day
  var todayWeather = $("<div>");
  var cityInfo = $("<h2>");
  var chosenCity = data[0].name;
  cityInfo.append(chosenCity);
  var date = dayjs().format("DD-MM-YYYY");
  cityInfo.append("   (" + date + ")");

  var weatherIcon = "https://openweathermap.org/img/wn/" + weather.list[0].weather[0].icon + "@2x.png";

  var todayIcon = $("<img>");
  todayIcon.attr("src", weatherIcon);
  cityInfo.append(todayIcon.width("75px"));
  todayWeather.append(cityInfo);

  var tempCity = weather.list[0].main.temp - 273.15;
  var cityWind = weather.list[0].wind.speed;
  var cityHum = weather.list[0].main.humidity;

  var todayList = $("<ul>")
  todayList.append(
    "<li>Temp: " + tempCity.toFixed(1) + "C</li>" +
    "<li>Wind: " + cityWind + "KPH</li>" +
    "<li>Humidity: " + cityHum + "%</li>");

  todayWeather.append(todayList);
  $("#today").css("border", "solid").css("padding", "10px");
  $(".container").removeAttr("hidden");
  $("#today").append(todayWeather);

  // 5 day forecast
  for (let day = 1; day <= 5; day++) {
    var forecast = $("<div>").addClass("box");
    var oneInfo = $("<h4>");
    var date = dayjs()
    var date1 = date.add(day, "day").format("DD-MM-YYYY");
    oneInfo.append(date1);

    var forecastIndex = day * 8 - 1
    var weatherIcon = "https://openweathermap.org/img/wn/" + weather.list[forecastIndex].weather[0].icon + "@2x.png";
    var todayIcon = $("<img>");
    todayIcon.attr("src", weatherIcon);
    oneInfo.append(todayIcon.width("75px"));
    forecast.append(oneInfo);
    
    var tempCity = weather.list[forecastIndex].main.temp - 273.15;
    var cityWind = weather.list[forecastIndex].wind.speed;
    var cityHum = weather.list[forecastIndex].main.humidity;

    var todayList = $("<ul>")
    todayList.append(
      "<li>Temp: " + tempCity.toFixed(1) + "C</li>" +
      "<li>Wind: " + cityWind + "KPH</li>" +
      "<li>Humidity: " + cityHum + "%</li>");
    forecast.append(todayList);
    $("#forecast").append(forecast);
  }
}


var citySearch = JSON.parse(localStorage.getItem("City")) || [];

function createBTN(city) {
  var newDiv = $("<div>");
  var addBTN = $("<button>").addClass("cityBtn").text(city);
  newDiv.append(addBTN);
  $(".buttons").prepend(newDiv);
}
citySearch.forEach(function (city) {
  createBTN(city);
});

$("#search-button").on("click", function (event) {
  event.preventDefault();
  var userSearch = $("#search-input").val();
  fetchWeatherData(userSearch);

  if (!citySearch.includes(userSearch)) {
    citySearch.push(userSearch);
    localStorage.setItem("City", JSON.stringify(citySearch));
    createBTN(userSearch);
  }
});



$(".cityBtn").on("click", function (event) {
  event.preventDefault();
  var cityName = $(event.target).text();
  fetchWeatherData(cityName);
});


















