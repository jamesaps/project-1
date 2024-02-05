var loading = false;
var loadingSpinnerContainer = document.getElementById('hotel-search-loading-spinner-container');
var hotelsContainer1 = document.getElementById('hotels-container');
var hotelsContainer2 = document.getElementById('hotels');
var searchButton = document.getElementById('searchBtn');

function fetchHotelData(cityName) {
  // if script is already processing a previous request, prevent a new request from being processed

  if (loading === true) {
    return;
  }

  putPageIntoLoadingState();

  $(".hotels").empty();
  $("#cityHotel").empty();
  const cityInput = "https://hotels-com-provider.p.rapidapi.com/v2/regions?query=" + cityName + "&domain=AE&locale=en_GB";
  const options2 = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '494e568795mshdacbfaf47fa8edep12317cjsn74147600f8bb',
      'X-RapidAPI-Host': 'hotels-com-provider.p.rapidapi.com'
    }
  };

  fetch(cityInput, options2)
    .then(function (response) {
      return response.json();
    })
    .then(function (location) {
      var cityData = location.data[0].gaiaId
      // console.log(cityData)
      console.log(location)

      var locale = "en_GB"
      var checkin_date = "2024-09-26"
      var sortOrder = "RECOMMENDED" // option
      var adults_number = "1"
      var domain = "AE"
      var checkout_date = "2024-09-28"

      var queryURL = "https://hotels-com-provider.p.rapidapi.com/v2/hotels/search?region_id=" + cityData + "&locale=" + locale + "&checkin_date=" + checkin_date + "&sort_order=" + sortOrder + "&adults_number=" + adults_number + "&domain=" + domain + "&checkout_date=" + checkout_date;
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': '494e568795mshdacbfaf47fa8edep12317cjsn74147600f8bb',
          'X-RapidAPI-Host': 'hotels-com-provider.p.rapidapi.com'
        }
      };

      fetch(queryURL, options)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {

          console.log(data);
          var hotelsIn = location.data[0].regionNames.primaryDisplayName;
          var cityHotels = $("<h3>");
          cityHotels.append("Hotels in " + hotelsIn);
          $("#cityHotel").append(cityHotels);


          for (let hotel = 1; hotel <= 5; hotel++) {
            var hotelOption = $("<div>").addClass("box");
            var oneInfo = $("<h4>");
            var forecastIndex = hotel + 1
            hotelOption.append(oneInfo);
            var propertyName = data.properties[forecastIndex].name;
            var propertyImage = data.properties[forecastIndex].propertyImage.image.url;
            var propertyPrice = data.properties[forecastIndex].price.lead.formatted;
            var propertyReview = data.properties[forecastIndex].reviews.score;
            var hotelList = $("<div>").addClass("cardDiv")
            var propertyTitle = $("<h5>")
            propertyTitle.append(propertyName)
            hotelOption.append(propertyTitle);
            hotelList.append(
              "Rating: " + propertyReview + "/10" + "<br>" + "Price per night: " + propertyPrice
            );
            hotelOption.append(hotelList);
            var propImg = $("<img>").attr("id", "imageH");
            propImg.attr("src", propertyImage);
            hotelOption.append(propImg);
            $(".hotels").append(hotelOption);
          }

          $(".dropdown-item").on("click", function () {
            // Update sortOrder when an item is clicked
            sortOrder = $(this).data("index");
            $(".hotels").empty();
            $("#cityHotel").empty();
            console.log(sortOrder);

            var queryURL = "https://hotels-com-provider.p.rapidapi.com/v2/hotels/search?region_id=" + cityData + "&locale=" + locale + "&checkin_date=" + checkin_date + "&sort_order=" + sortOrder + "&adults_number=" + adults_number + "&domain=" + domain + "&checkout_date=" + checkout_date;
            const options = {
              method: 'GET',
              headers: {
                'X-RapidAPI-Key': '494e568795mshdacbfaf47fa8edep12317cjsn74147600f8bb',
                'X-RapidAPI-Host': 'hotels-com-provider.p.rapidapi.com'
              }
            };

            fetch(queryURL, options)
              .then(function (response) {
                return response.json();
              })
              .then(function (data) {

                console.log(data);
                var hotelsIn = location.data[0].regionNames.primaryDisplayName;
                var cityHotels = $("<h3>");
                cityHotels.append("Hotels in " + hotelsIn);
                $("#cityHotel").append(cityHotels);

                for (let hotel = 1; hotel <= 5; hotel++) {
                  var hotelOption = $("<div>").addClass("box");
                  var oneInfo = $("<h4>");
                  var forecastIndex = hotel + 1
                  hotelOption.append(oneInfo);
                  var propertyName = data.properties[forecastIndex].name;
                  var propertyImage = data.properties[forecastIndex].propertyImage.image.url;
                  var propertyPrice = data.properties[forecastIndex].price.lead.formatted;
                  var propertyReview = data.properties[forecastIndex].reviews.score;
                  var hotelList = $("<div>").addClass("cardDiv")
                  var propertyTitle = $("<h5>")
                  propertyTitle.append(propertyName)
                  hotelOption.append(propertyTitle);
                  hotelList.append(
                    "Rating: " + propertyReview + "/10" + "<br>" + "Price per night: " + propertyPrice
                  );
                  hotelOption.append(hotelList);
                  var propImg = $("<img>").attr("id", "imageH");
                  propImg.attr("src", propertyImage);
                  hotelOption.append(propImg);
                  $(".hotels").append(hotelOption);
                }
              });
          });

          takePageOutOfLoadingState();

          $('html, body').animate({
            scrollTop: $("#hotels-container").offset().top
          }, 1000);
        });
    }).catch(function (error) {
      takePageOutOfLoadingState();

      console.log(error);
    });
}

function putPageIntoLoadingState() {
  showElement(loadingSpinnerContainer);
  hideElement(hotelsContainer1);
  hideElement(hotelsContainer2);
  searchButton.disabled = true;

  $('html, body').animate({
    scrollTop: $("#hotel-search-loading-spinner-container").offset().top
  }, 1000);

  loading = true;
}

function takePageOutOfLoadingState() {
  hideElement(loadingSpinnerContainer);
  showElement(hotelsContainer1);
  showElement(hotelsContainer2);
  searchButton.disabled = false;

  loading = false;
}

function hideElement(element) {
  element.classList.add('d-none');
}

function showElement(element) {
  element.classList.remove('d-none');
}
$("#searchBtn").on("click", function (event) {
  event.preventDefault();
  $("#dropDown").show();
  var cityName = $("#searchBox").val();
  fetchHotelData(cityName);
  // $('html, body').animate({
  //   scrollTop: $(".hotels").offset().top
  // }, 1000);

});
