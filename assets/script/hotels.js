const cityInput = "https://hotels-com-provider.p.rapidapi.com/v2/regions?query=" + "New York" + "&domain=AE&locale=en_GB";
const options2 = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '9c0a5b734amsh5b8690e71f87c5cp1570e5jsn4366c4881b2c',
		'X-RapidAPI-Host': 'hotels-com-provider.p.rapidapi.com'
	}
};

fetch(cityInput, options2)
.then(function (response) {
  return response.json();
})
.then(function (data) {
    var cityData = data.data[0].gaiaId
    // console.log(cityData)
console.log(data) 

// var regionID = "2 // need to know how to find this out from user input
var locale = "en_GB"
var checkin_date = "2024-09-26"
var sortOrder = "DISTANCE" // option
var adults_number = "1"
var domain = "AE"
var checkout_date = "2024-09-28"


var queryURL = "https://hotels-com-provider.p.rapidapi.com/v2/hotels/search?region_id=" + cityData + "&locale=" + locale + "&checkin_date=" + checkin_date + "&sort_order=" + sortOrder + "&adults_number=" + adults_number + "&domain="  + domain + "&checkout_date=" + checkout_date;
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '9c0a5b734amsh5b8690e71f87c5cp1570e5jsn4366c4881b2c',
		'X-RapidAPI-Host': 'hotels-com-provider.p.rapidapi.com'
	}
};

  fetch(queryURL, options)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {

    //   console.log(data);
      var propertyName = data.properties[0].name;
      var propertyImage = data.properties[0].propertyImage.image.url;
      var propertyPrice = data.properties[0].price.lead.amount;
      var propertyReview = data.properties[0].reviews.score;

    //   var propName = $("<h2>");
    //   propName.append(propertyName);
    //   var propImg = $("<img>");
    //   propImg.attr("src",propertyImage);
    //   var propPrice = $("<h2>");
    //   propPrice.append("£",propertyPrice);
    //   var propReview = $("<h2>");
    //   propReview.append(propertyReview, "/10");
    //   $(".hotels").append(propName);      
    //   $(".hotels").append(propImg);
    //   $(".hotels").append(propPrice);
    //   $(".hotels").append(propReview);



      for (let hotel = 1; hotel <= 5; hotel++) {
        var hotelOption = $("<div>");
        var oneInfo = $("<h4>");
        var forecastIndex = hotel * 8 - 1
        hotelOption.append(oneInfo);
        var propertyName = data.properties[forecastIndex].name;
        var propertyImage = data.properties[forecastIndex].propertyImage.image.url;
        var propertyPrice = data.properties[forecastIndex].price.lead.amount;
        var propertyReview = data.properties[forecastIndex].reviews.score;
        var hotelList = $("<ul>")
        hotelList.append(
            "<li>" + propertyName + "</li>" +
            "<li>" + propertyReview + "</li>" +           
            "<li>£" + propertyPrice.toFixed(2) + "</li>");
          hotelOption.append(hotelList);
          var propImg = $("<img>");
          propImg.attr("src",propertyImage);
          hotelOption.append(propImg);
        $(".hotels").append(hotelOption);
      }
        
    });
})

// var regionID = "2872" // need to know how to find this out from user input
// var locale = "en_GB"
// var checkin_date = "2024-09-26"
// var sortOrder = "REVIEW"
// var adults_number = "1"
// var domain = "AE"
// var checkout_date = "2024-09-28"
// var regionInput = "London"


// var queryURL = "https://hotels-com-provider.p.rapidapi.com/v2/hotels/search?region_id=" + regionID + "&locale=" + locale + "&checkin_date=" + checkin_date + "&sort_order=" + sortOrder + "&adults_number=" + adults_number + "&domain="  + domain + "&checkout_date=" + checkout_date;
// const options = {
// 	method: 'GET',
// 	headers: {
// 		'X-RapidAPI-Key': '9c0a5b734amsh5b8690e71f87c5cp1570e5jsn4366c4881b2c',
// 		'X-RapidAPI-Host': 'hotels-com-provider.p.rapidapi.com'
// 	}
// };

//   fetch(queryURL, options)
//     .then(function (response) {
//       return response.json();
//     })
//     .then(function (data) {

//     //   console.log(data);
//       var propertyName = data.properties[0].name;
//       var propertyImage = data.properties[0].propertyImage.image.url;
//       var propertyPrice = data.properties[0].price.lead.amount;
//       var propertyReview = data.properties[0].reviews.score;

//     //   var propName = $("<h2>");
//     //   propName.append(propertyName);
//     //   var propImg = $("<img>");
//     //   propImg.attr("src",propertyImage);
//     //   var propPrice = $("<h2>");
//     //   propPrice.append("£",propertyPrice);
//     //   var propReview = $("<h2>");
//     //   propReview.append(propertyReview, "/10");
//     //   $(".hotels").append(propName);      
//     //   $(".hotels").append(propImg);
//     //   $(".hotels").append(propPrice);
//     //   $(".hotels").append(propReview);



//       for (let hotel = 1; hotel <= 5; hotel++) {
//         var hotelOption = $("<div>");
//         var oneInfo = $("<h4>");
//         var forecastIndex = hotel * 8 - 1
//         hotelOption.append(oneInfo);
//         var propertyName = data.properties[forecastIndex].name;
//         var propertyImage = data.properties[forecastIndex].propertyImage.image.url;
//         var propertyPrice = data.properties[forecastIndex].price.lead.amount;
//         var propertyReview = data.properties[forecastIndex].reviews.score;
//         var hotelList = $("<ul>")
//         hotelList.append(
//             "<li>" + propertyName + "</li>" +
//             "<li>" + propertyReview + "</li>" +           
//             "<li>£" + propertyPrice.toFixed(2) + "</li>");
//           hotelOption.append(hotelList);
//           var propImg = $("<img>");
//           propImg.attr("src",propertyImage);
//           hotelOption.append(propImg);
//         $(".hotels").append(hotelOption);
//       }
        
//     });
