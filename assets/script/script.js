var loading = false;
var jumbotronDocked = false;

var loadingSpinnerContainer = document.getElementById('hotel-search-loading-spinner-container');
var jumbotronContainer = document.getElementById('jumbotron-container');
var jumbotron = document.getElementById('jumbotron');

var hotelSearchLocationElement = document.getElementById('hotels-location');
var hotelSearchForm = document.getElementById('hotel-search-form');
var hotelSearchButton = document.getElementById('hotel-search-button');
var hotelSearchBox = document.getElementById('hotel-search-box');
var hotelSearchIcon = document.getElementById('hotel-search-icon');

var hotelsHeaderContainer = document.getElementById('hotels-header-container');
var hotelsBodyContainer = document.getElementById('hotels-container');

var apiKey = '37a742acecmshb1d0cea778ef597p1c03a8jsn8195f29d98b6';
var apiHost = 'hotels-com-provider.p.rapidapi.com';

var numberOfHotelsToDisplay = 8;

var map;
var mapContainer;

var apiOptions = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': apiHost,
  }
};

var saveOptions = {
  searchTerms: 0,
  regions: 1,
  hotels: 2,
}

var searchTermsData = {}; // { searchTerm: regionId }
var regionsData = {}; // { regionId: [{id, name}]}
var hotelsData = {}; // { regionId: [hotel+options] }

loadDataFromLocalStorage();

function loadDataFromLocalStorage() {
  var localStorageSearchTerms = localStorage.getItem('searchTerms');
  var localStorageRegions = localStorage.getItem('regions');
  var localStorageHotels = localStorage.getItem('hotels');

  if (localStorageSearchTerms !== null) {
    searchTermsData = JSON.parse(localStorageSearchTerms);
  }

  if (localStorageRegions !== null) {
    regionsData = JSON.parse(localStorageRegions);
  }

  if (localStorageHotels !== null) {
    hotelsData = JSON.parse(localStorageHotels);
  }
}

function saveDataToLocalStorage(saveOption) {
  if (saveOption === undefined || saveOption === saveOptions.searchTerms) {
    saveObjectToLocalStorage('searchTerms', searchTermsData);
  }

  if (saveOption === undefined || saveOption === saveOptions.regions) {
    saveObjectToLocalStorage('regions', regionsData)
  }

  if (saveOption === undefined || saveOption === saveOptions.hotels) {
    saveObjectToLocalStorage('hotels', hotelsData);
  }
}

function saveObjectToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

async function searchLocationForHotels(options = {}, overrideLocation) {
  // if script is already processing a previous request, prevent a new request from being processed
  if (loading === true) {
    return;
  }

  if (overrideLocation !== undefined) {
    hotelSearchBox.value = overrideLocation;
  }

  var locationName = hotelSearchBox.value;

  hotelSearchBox.blur();

  putPageIntoLoadingState();
  emptyHotelContainers();

  await simulateNetworkCall();

  var regionDetails = await getRegionDetailsByLocationName(locationName);
  var hotels = await getHotelsByRegionId(regionDetails.id, options);

  renderHotels(regionDetails.name, hotels, numberOfHotelsToDisplay);

  takePageOutOfLoadingState();

  updateMapWithRenderedHotels(hotels, numberOfHotelsToDisplay);
  scrollToElement(hotelsHeaderContainer);
}

async function getRegionDetailsByLocationName(searchTerm) {
  var regionsDetailsByLocationNameFromLocalStorage = getRegionDetailsByLocationNameFromLocalStorage(searchTerm);

  if (regionsDetailsByLocationNameFromLocalStorage !== undefined) {
    return regionsDetailsByLocationNameFromLocalStorage;
  }

  var url = "https://hotels-com-provider.p.rapidapi.com/v2/regions?query=" + searchTerm + "&domain=AE&locale=en_GB";

  var response = await fetch(url, apiOptions);
  var decodedResponse = await response.json();

  console.log(`Made an API call to retrieve location details for search term: "${searchTerm}".`);

  var regionDetails = {
    name: decodedResponse.data[0].regionNames.primaryDisplayName,
    id: decodedResponse.data[0].gaiaId,
  };

  addSearchTermToLocalStorage(searchTerm, regionDetails.id);
  addRegionDetailsToLocalstorage(regionDetails.id, regionDetails);

  return regionDetails;
}

function addSearchTermToLocalStorage(locationName, regionId) {
  var searchTermTrimmedAndLowercased = locationName.trim().toLowerCase();

  searchTermsData[searchTermTrimmedAndLowercased] = regionId;

  saveDataToLocalStorage(saveOptions.searchTerms);

  console.log(`Saved search term: "${locationName}" to local storage.`)
}

function getRegionDetailsByLocationNameFromLocalStorage(searchTerm) {
  var searchTermTrimmedAndLowercased = searchTerm.trim().toLowerCase();

  var regionIdBySearchTerm = searchTermsData[searchTermTrimmedAndLowercased];

  if (regionIdBySearchTerm === undefined) {
    return undefined;
  }

  console.log(`Search term: "${searchTerm}" retrieved from local storage with regionId: ${regionIdBySearchTerm}.`);

  var regionDetailsByRegionId = regionsData[regionIdBySearchTerm];

  // returns undefined if not found in local storage and can be handled by caller, otherwise returns value found in local storage
  if (regionIdBySearchTerm === undefined) {
    return undefined;
  }

  console.log(`Region details for Region ID: ${regionIdBySearchTerm} retrieved from local storage.`);

  return regionDetailsByRegionId;
}

function addRegionDetailsToLocalstorage(regionId, regionDetails) {
  regionsData[regionId] = regionDetails;

  saveDataToLocalStorage(saveOptions.regions);

  console.log(`Saved region details for Region ID: ${regionId} to local storage.`)
}

async function getHotelsByRegionId(regionId, options = {}) {
  if (options.locale === undefined) {
    options.locale = "en_GB";
  }

  if (options.checkinDate === undefined) {
    options.checkinDate = "2024-09-26";
  }

  if (options.sortOrder === undefined) {
    options.sortOrder = "RECOMMENDED";
  }

  if (options.adultsNumber === undefined) {
    options.adultsNumber = "1"
  }

  if (options.domain === undefined) {
    options.domain = "AE";
  }

  if (options.checkoutDate === undefined) {
    options.checkoutDate = "2024-09-28";
  }

  var hotelsByRegionFromLocalStorage = getHotelsByRegionIdFromLocalStorage(regionId, options);

  if (hotelsByRegionFromLocalStorage !== undefined) {
    return hotelsByRegionFromLocalStorage;
  }

  var url = "https://hotels-com-provider.p.rapidapi.com/v2/hotels/search?region_id=" + regionId
    + "&locale=" + options.locale
    + "&checkin_date=" + options.checkinDate
    + "&sort_order=" + options.sortOrder
    + "&adults_number=" + options.adultsNumber
    + "&domain=" + options.domain
    + "&checkout_date=" + options.checkoutDate;

  var response = await fetch(url, apiOptions);
  var decodedResponse = await response.json();

  var hotels = decodedResponse.properties;

  console.log(`Made API call to retrieve hotels for Region ID: ${regionId} with options: ${JSON.stringify(options)}.`);

  addHotelsToLocalStorage(regionId, hotels, options);

  return hotels;
}

function getHotelsByRegionIdFromLocalStorage(regionId, options) {
  var hotelsKey = createHotelsSearchKey(regionId, options);
  console.log(hotelsKey)
  var hotels = hotelsData[hotelsKey];

  if (hotels === undefined) {
    return undefined;
  }

  console.log(`Hotels for Region ID: ${regionId} with options: ${JSON.stringify(options)} retrieved from local storage.`)

  return hotels;
}

function addHotelsToLocalStorage(regionId, hotels, options) {
  var hotelsKey = createHotelsSearchKey(regionId, options);
  hotelsData[hotelsKey] = hotels;

  saveDataToLocalStorage(saveOptions.hotels);

  console.log(`Saved hotels for Region ID: ${regionId} with options: ${JSON.stringify(options)} to local storage.`)
}

function renderHotels(regionName, hotels, numberOfHotelsToDisplay = numberOfHotelsToDisplay) {
  emptyHotelContainers();

  var hotelContainerHeader = createHotelContainerHeader(regionName);
  $(hotelSearchLocationElement).append(hotelContainerHeader);

  createHotelGrid(hotels);
}

function createHotelGrid(hotels, columns = 4) {
  createGridTemplateAreasString(hotels, columns);
  hotelsBodyContainer.style.gridTemplateColumns = createGridTemplateColumnsString(columns);

  createMapContainer();
  hotelsBodyContainer.appendChild(mapContainer);

  for (var i = 0; i < hotels.length; ++i) {
    var hotelCard = createHotelCard(hotels[i], i);
    hotelsBodyContainer.appendChild(hotelCard);
  }
}

function createGridTemplateAreasString(hotels, columns) {
  var gridTemplateAreas = [];
  var gridTemplateAreasSmallerScreens = [];
  var mapColumnSpan = 2;
  var mapRowSpan = 3;

  var hotelIndex = 0;
  var hotelIndexSmallScreen = 0;

  for (var i = 0; i < mapRowSpan; ++i) { // create a square space spanning mapSpan x mapSpan rows and columns in the top right of the grid
    var templateRow = [];
    var templateRowSmallScreen = [];

    for (var j = 0; j < columns; ++j) {
      templateRowSmallScreen.push('map');
    }

    for (var j = 0; j < columns; ++j) {
      if (j >= columns - mapColumnSpan) {
        templateRow.push('map');
      } else if (hotelIndex >= hotels.length) {
        templateRow.push('.');
      } else {
        templateRow.push(`hotel-${hotelIndex}`);
        templateRow.push(`hotel-${hotelIndex}`);

        hotelIndex += 1;
        ++j;
      }
    }

    gridTemplateAreas.push(templateRow);
    gridTemplateAreasSmallerScreens.push(templateRowSmallScreen);
  }

  while (hotelIndexSmallScreen < hotels.length) {
    var templateRowSmallScreen = [];

    if (hotelIndexSmallScreen < hotels.length) {
      templateRowSmallScreen.push(`hotel-${hotelIndexSmallScreen}`);
      templateRowSmallScreen.push(`hotel-${hotelIndexSmallScreen}`);
      templateRowSmallScreen.push(`hotel-${hotelIndexSmallScreen}`);
      templateRowSmallScreen.push(`hotel-${hotelIndexSmallScreen}`);

      gridTemplateAreasSmallerScreens.push(templateRowSmallScreen);
    }

    hotelIndexSmallScreen += 1;
  }

  while (hotelIndex < hotels.length) { // fill the rest of the grid with remaining hotels that need to be rendered
    var templateRow = [];

    for (var i = 0; i < columns / 2; ++i) {
      if (hotelIndex + i < hotels.length) {
        templateRow.push(`hotel-${hotelIndex + i}`);
        templateRow.push(`hotel-${hotelIndex + i}`);
      } else {
        templateRow.push('.');
        templateRow.push('.');
      }
    }

    gridTemplateAreas.push(templateRow);

    hotelIndex += columns / 2;
  }

  var gridTemplateAreasString = '';

  for (var i = 0; i < gridTemplateAreas.length; ++i) {
    gridTemplateAreasString += `"${gridTemplateAreas[i].join(' ')}"`;

    if (i !== gridTemplateAreas.length - 1) {
      gridTemplateAreasString += '\n';
    }
  }

  console.log(gridTemplateAreasSmallerScreens.slice(0, 5))

  var gridTemplateAreasString = createGridTemplateAreasStringFromGridTemplateAreas(gridTemplateAreas);
  var gridTemplateAreasSmallerScreensString = createGridTemplateAreasStringFromGridTemplateAreas(gridTemplateAreasSmallerScreens);

  console.log(gridTemplateAreasString);

  // Add the grid template areas styles to the document head because media queries cannot be applied inline

  var css = `
    #hotels-container {
      grid-template-areas: ${gridTemplateAreasSmallerScreensString};
    }

    @media screen and (min-width: 992px) {
      #hotels-container {
        grid-template-areas: ${gridTemplateAreasString};
      }
    }
  `;

  let style = document.getElementById('hotel-grid-styles');
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('id', 'hotel-grid-styles');
    document.head.appendChild(style);
  }

  style.innerHTML = css;
}

function createGridTemplateAreasStringFromGridTemplateAreas(gridTemplateAreas) {
  var gridTemplateAreasString = '';

  for (var i = 0; i < gridTemplateAreas.length; ++i) {
    gridTemplateAreasString += `"${gridTemplateAreas[i].join(' ')}"`;

    if (i !== gridTemplateAreas.length - 1) {
      gridTemplateAreasString += '\n';
    }
  }

  return gridTemplateAreasString;
}

function createGridTemplateColumnsString(columns) {
  var gridTemplateColumnsString = '';

  for (var i = 0; i < columns; ++i) {
    gridTemplateColumnsString += '1fr ';
  }

  return gridTemplateColumnsString.trim();
}

var flag = true;
var flag2 = true;

function createHotelCard(hotel, index) {
  if (flag) {
    console.log(hotel);
    flag = false;
  }

  if (flag2 && hotel.star !== null) {
    console.log(hotel);
    flag2 = false;
  }

  var hotelCard = document.createElement('div');
  hotelCard.classList.add('hotel-card');
  hotelCard.style.gridArea = `hotel-${index}`;

  var hotelCardImageHolder = document.createElement('div');
  hotelCardImageHolder.classList.add('hotel-card-image-holder');
  hotelCardImageHolder.style.backgroundImage = `url(${hotel.propertyImage.image.url})`;

  var hotelCardBody = document.createElement('div');
  hotelCardBody.classList.add('hotel-card-body');

  var hotelCardTop = document.createElement('div');
  hotelCardTop.classList.add('hotel-card-top');

  var hotelCardBottom = document.createElement('div');
  hotelCardBottom.classList.add('hotel-card-bottom');

  var hotelCardBottomLeft = document.createElement('div');
  hotelCardBottomLeft.classList.add('hotel-card-bottom-left');

  var hotelCardBottomMiddle = document.createElement('div');
  hotelCardBottomMiddle.classList.add('hotel-card-bottom-middle');

  var hotelCardBottomRight = document.createElement('div');
  hotelCardBottomRight.classList.add('hotel-card-bottom-right');

  var hotelCardlName = document.createElement('div');
  hotelCardlName.classList.add('hotel-card-name');
  hotelCardlName.textContent = hotel.name;

  var hotelCardLocation = document.createElement('div');
  hotelCardLocation.classList.add('hotel-card-location');
  hotelCardLocation.textContent = hotel.neighborhood.name;

  var hotelCardRating = document.createElement('div');
  hotelCardRating.classList.add('hotel-card-rating');

  var hotelCardRatingNumber = document.createElement('div');
  hotelCardRatingNumber.classList.add('hotel-card-rating-number');
  hotelCardRatingNumber.textContent = hotel.reviews.score.toFixed(1);

  var hotelCardRatingOutOfText = document.createElement('div');
  hotelCardRatingOutOfText.classList.add('hotel-card-rating-out-of-text');
  hotelCardRatingOutOfText.textContent = '/';

  var hotelCardRatingOutOfNumber = document.createElement('div');
  hotelCardRatingOutOfNumber.classList.add('hotel-card-rating-out-of-number');
  hotelCardRatingOutOfNumber.textContent = '10';

  var hotelCardReviewsNumber = document.createElement('div');
  hotelCardReviewsNumber.classList.add('hotel-card-reviews-number');
  hotelCardReviewsNumber.textContent = `${hotel.reviews.total} Reviews`;

  var hotelCardPrice = document.createElement('div');
  hotelCardPrice.classList.add('hotel-card-price');

  var hotelCardPriceAmount = document.createElement('div');
  hotelCardPriceAmount.classList.add('hotel-card-price-amount');
  hotelCardPriceAmount.textContent = hotel.price.lead.amount.toFixed(2);

  var hotelCardPriceCurrency = document.createElement('div');
  hotelCardPriceCurrency.classList.add('hotel-card-price-currency');
  hotelCardPrice.textContent = hotel.price.lead.currencyInfo.symbol;

  var hotelCardPriceUnit = document.createElement('div');
  hotelCardPriceUnit.classList.add('hotel-card-price-unit');
  hotelCardPriceUnit.textContent = hotel.price.priceMessages[0].value;

  hotelCard.appendChild(hotelCardImageHolder);
  hotelCard.appendChild(hotelCardBody);

  hotelCardBody.appendChild(hotelCardTop);
  hotelCardBody.appendChild(hotelCardBottom);

  hotelCardTop.appendChild(hotelCardlName);
  hotelCardTop.appendChild(hotelCardLocation);

  hotelCardBottom.append(hotelCardBottomLeft);
  hotelCardBottom.append(hotelCardBottomMiddle);
  hotelCardBottom.append(hotelCardBottomRight);

  hotelCardBottomLeft.appendChild(hotelCardPrice);
  hotelCardBottomLeft.appendChild(hotelCardPriceUnit);

  hotelCardBottomRight.appendChild(hotelCardRating);
  hotelCardBottomRight.appendChild(hotelCardReviewsNumber);

  hotelCardRating.appendChild(hotelCardRatingNumber);
  hotelCardRating.appendChild(hotelCardRatingOutOfText);
  hotelCardRating.appendChild(hotelCardRatingOutOfNumber);

  hotelCardPrice.appendChild(hotelCardPriceCurrency);
  hotelCardPrice.appendChild(hotelCardPriceAmount);

  return hotelCard;

  var hotelContainer = $("<div>").addClass("box");

  var hotelTitle = $("<h5>");
  hotelTitle.append(hotel.name);
  hotelContainer.append(hotelTitle);

  var hotelDetailsContainer = $("<div>").addClass("cardDiv")
  hotelContainer.append(hotelDetailsContainer);

  var hotelDetails = "Rating: " + hotel.reviews.score + "/10" + "<br>" + "Price per night: " + hotel.price.lead.formatted;
  hotelDetailsContainer.append(hotelDetails);

  var hotelImage = $("<img>").attr("id", "imageH");
  hotelImage.attr("src", hotel.propertyImage.image.url);
  hotelDetailsContainer.append(hotelImage);

  return hotelContainer;
}

function createHotelContainerHeader(regionName) {
  var hotelHeader = $("<h3>");
  hotelHeader.append("Hotels in " + regionName);

  return hotelHeader;
}

function createMapContainer() {
  mapContainer = document.createElement('div');
  mapContainer.setAttribute('id', 'map-container');
  mapContainer.classList.add('d-none');
  mapContainer.style.gridArea = 'map';

  var mapElement = document.createElement('div');
  mapElement.setAttribute('id', 'map');
  mapContainer.appendChild(mapElement);

  return mapContainer;
}

function putPageIntoLoadingState() {
  showElement(loadingSpinnerContainer);
  hideElement(hotelSearchIcon);
  hideElement(hotelsHeaderContainer);
  hideElement(hotelsBodyContainer);
  hotelSearchButton.disabled = true;
  hideElement(mapContainer);

  loading = true;
}

function takePageOutOfLoadingState() {
  hideElement(loadingSpinnerContainer);
  showElement(hotelSearchIcon);
  showElement(hotelsHeaderContainer);
  showElement(hotelsBodyContainer);
  hotelSearchButton.disabled = false;
  showElement(mapContainer);
  // clearSearchBar();

  dockJumbotron();

  loading = false;
}

function hideElement(element) {
  if (element === undefined) {
    return;
  }

  element.classList.add('d-none');
}

function showElement(element) {
  if (element === undefined) {
    return;
  }

  element.classList.remove('d-none');
}

function emptyElement(element) {
  if (element === undefined) {
    return;
  }

  element.innerHTML = '';
}

function emptyHotelContainers() {
  // emptyElement(hotelsHeaderContainer);
  emptyElement(hotelsBodyContainer);
  emptyElement(hotelSearchLocationElement);
}

function scrollToElement(element) {
  return;
  // turn off smooth scroll which interacts weirdly with scrollTop
  document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');

  $('html, body').stop().animate({ // Prevent page being overwhelmed by scroll animations
    scrollTop: $(element).offset().top
  }, 1000, undefined, function () {
    // restore default scroll behavior
    document.documentElement.style.removeProperty('scroll-behavior');
  });
}

function createHotelsSearchKey(regionId, options) {
  var optionsAsSortedArrayToJSONString = convertObjectToArrayOfKeyValuePairsSortedByKeyAsJSONString(options);
  return `${regionId}${optionsAsSortedArrayToJSONString}`;
}

function clearSearchBar() {
  hotelSearchBox.value = '';
}

function dockJumbotron() {
  if (jumbotronDocked) {
    return;
  }

  jumbotronDocked = true;
  jumbotron.classList.add('docked-jumbotron');

  hotelSearchForm.classList.add('docked-hotel-search-form');
  hotelSearchForm.classList.remove('col-md-8');
}

function convertObjectToArrayOfKeyValuePairsSortedByKeyAsJSONString(object) {
  var objectAsArray = Object.entries(object);
  var objectAsSortedArray = objectAsArray.sort(function (a, b) {
    if (a[0] === b[0]) {
      return 0;
    } else if (a[0] > b[0]) {
      return 1;
    } else {
      return -1;
    }
  });

  return JSON.stringify(objectAsSortedArray);
}

async function simulateNetworkCall() {
  return new Promise(resolve => setTimeout(resolve, getRandomInt(500, 2000)));
}

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

$(hotelSearchForm).on('submit', function (event) {
  event.preventDefault();
  searchLocationForHotels();
});

$(".dropdown-item").on("click", function (event) {
  event.preventDefault();

  // Update sortOrder when an item is clicked
  sortOrder = $(this).data("index");

  searchLocationForHotels({ sortOrder });
});

window.addEventListener('load', function () {
  hotelSearchBox.focus();
  // searchLocationForHotels({}, 'London');
});

/* Maps functionality Start */

var mapMarkers = [];

function updateMapWithRenderedHotels(hotels, numberOfHotelsToDisplay) {
  var slicedHotels = hotels.slice(0, numberOfHotelsToDisplay);

  resetMap();
  createMapMarkersForHotels(slicedHotels);
  addMarkersToMap();
  fitMapToMarkers();
}

function createMapMarkersForHotels(hotels) {
  mapMarkers = [];

  for (var i = 0; i < hotels.length; ++i) {
    createMapMarker(hotels[i]);
  }
}

function createMapMarker(hotel) {
  var { latitude, longitude } = hotel.mapMarker.latLong;
  var latLng = [latitude, longitude];

  var marker = L.marker(latLng, { title: hotel.name });
  mapMarkers.push(marker);

  var popupElement = document.createElement('div');
  popupElement.textContent = hotel.name;

  var popup = L.popup()
    .setLatLng(latLng)
    .setContent(popupElement);

  marker.bindPopup(popup);
  marker.on('click', function (e) {
    var popup = e.target.getPopup();
  })
}

function addMarkersToMap() {
  for (var i = 0; i < mapMarkers.length; ++i) {
    mapMarkers[i].addTo(map);
  }
}

function fitMapToMarkers() {
  var featureGroup = L.featureGroup(mapMarkers);
  map.fitBounds(featureGroup.getBounds());
}

function resetMap() {
  if (map !== undefined) {
    map.off();
    map.remove();
  }

  map = L.map('map').setView([51.05, -0.09], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
}

/* Maps functionality End */

/* Weather functionality Start */

var apiKey = '60138034af71780e3420402cea540efb';

var geoApiURLPrefix = 'https://api.openweathermap.org/geo/1.0/direct?';
var currentWeatherApiURLPrefix = 'https://api.openweathermap.org/data/2.5/weather?';
var forecastWeatherApiURLPrefix = 'https://api.openweathermap.org/data/2.5/forecast?';

var weatherApiError = ''; // non empty string when an api error occurs - globally scoped because it is accessed in numerous closures

async function getLatAndLonByLocationName(location) {
  // instantiate return object
  var coordinates = {};

  // create query string portion of URL from user input
  var queryString = `q=${location}`;
  // create App ID portion of URL using API key
  var appId = `appid=${apiKey}`;

  // construct url using components above
  var url = geoApiURLPrefix + [queryString, appId].join('&');

  // Attempt to perform fetch request on URL. If this returns a 404, despite being caught, Google Chrome will display this error in the browser

  var response = await fetch(url);

  if (!response.ok) {
    updateApiError('An API Error occurred. Please try again later.');
    throw new Error(response.statusText);
  }

  var locations = await response.json();

  if (locations.length === 0) {
    updateApiError('Location not found.');
    throw new Error(`Location ${location} was not recognised.`);
  }

  var { name, lat, lon } = locations[0];

  coordinates.name = name;
  coordinates.lat = lat;
  coordinates.lon = lon;

  return coordinates;
}

async function getCurrentWeatherData(coordinates) {
  // instantiate current weather data return object
  var currentWeatherData = {};

  // construct url using user provided latitude and longitude
  var url = currentWeatherApiURLPrefix + `lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${apiKey}`;

  var response = await fetch(url);

  if (!response.ok) {
    updateApiError('An API Error occurred. Please try again later.');
    throw new Error(response.statusText);
  }

  var weatherData = await response.json();

  // offset date to show weather-local timezone despite dayjs being configured to user-local timezone
  var date = dayjs(weatherData.dt * 1000 + weatherData.timezone * 1000 + timezoneOffset * 60 * 1000);

  currentWeatherData.location = coordinates.name;
  currentWeatherData.date = date;
  currentWeatherData.temperature = convertTemperatureInKtoC(weatherData.main.temp).toFixed(2); // API returns weather in Kelvin so we convert to Celsius using a helper function before returning
  currentWeatherData.wind = convertMpsToKph(weatherData.wind.speed).toFixed(2); // API returns m/s so we convert to kph first
  currentWeatherData.humidity = weatherData.main.humidity;
  currentWeatherData.weatherIcons = weatherData.weather.map(condition => condition.icon);

  return currentWeatherData;
}

function getLocationCoordinatesFromLocalStorage(location) {
  var locationTrimmedToLowerCase = location.trim().toLowerCase();
  renderPreviouslySearchedLocations();

  var coordinates = localStorageCoordinates.find((element) => element.trimmedName === locationTrimmedToLowerCase);

  // Move coordinates to end of the storage so they appear first in history list even
  if (coordinates !== undefined) {
    localStorageCoordinates = localStorageCoordinates.filter(element => element.trimmedName !== locationTrimmedToLowerCase);

    localStorageCoordinates.push(coordinates);
    saveLocationCoordinatesToLocalStorage();
  }

  return coordinates;
}

function addLocationCoordinatesToLocalStorage(location, coordinates) {
  var locationTrimmedToLowerCase = location.trim().toLowerCase();

  if (getLocationCoordinatesFromLocalStorage(location) !== undefined) {
    return;
  }

  coordinates.trimmedName = locationTrimmedToLowerCase;

  localStorageCoordinates.push(coordinates);
  saveLocationCoordinatesToLocalStorage();
}

function saveLocationCoordinatesToLocalStorage() {
  var localStorageCoordinatesStringified = JSON.stringify(localStorageCoordinates);

  localStorage.setItem('coordinates', localStorageCoordinatesStringified);
  renderPreviouslySearchedLocations();
}

function updateWeatherApiError(newError) {
  if (weatherApiError === '') {
    weatherApiError = newError;
  }
}

/* Weather functionality End */