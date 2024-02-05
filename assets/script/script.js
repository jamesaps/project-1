var loading = false;
var loadingSpinnerContainer = document.getElementById('hotel-search-loading-spinner-container');
var hotelsHeaderContainer = document.getElementById('hotels-container');
var hotelsBodyContainer = document.getElementById('hotels');
var hotelSearchLocationElement = document.getElementById('cityHotel');
var searchForm = document.getElementById('surroundBox');
var searchButton = document.getElementById('searchBtn');
var searchLoadingSpinnerContainer = document.getElementById('hotel-search-loading-spinner-container');

var apiKey = '494e568795mshdacbfaf47fa8edep12317cjsn74147600f8bb';
var apiHost = 'hotels-com-provider.p.rapidapi.com';

var apiOptions = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': apiHost,
  }
};

async function searchLocationForHotels(options = {}) {
  // if script is already processing a previous request, prevent a new request from being processed
  if (loading === true) {
    return;
  }

  var locationName = $('#searchBox').val();

  putPageIntoLoadingState();
  emptyHotelContainers();


  var regionDetails = await getRegionDetailsByLocationName(locationName);
  var hotels = await getHotelsByRegionId(regionDetails.id);

  renderHotels(regionDetails.name, hotels);

  takePageOutOfLoadingState();
  scrollToElement(hotelsHeaderContainer);
}

async function getRegionDetailsByLocationName(locationName) {
  var url = "https://hotels-com-provider.p.rapidapi.com/v2/regions?query=" + locationName + "&domain=AE&locale=en_GB";

  var response = await fetch(url, apiOptions);
  var decodedResponse = await response.json();

  return {
    name: decodedResponse.data[0].regionNames.primaryDisplayName,
    id: decodedResponse.data[0].gaiaId,
  };
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

  var url = "https://hotels-com-provider.p.rapidapi.com/v2/hotels/search?region_id=" + regionId
    + "&locale=" + options.locale
    + "&checkin_date=" + options.checkinDate
    + "&sort_order=" + options.sortOrder
    + "&adults_number=" + options.adultsNumber
    + "&domain=" + options.domain
    + "&checkout_date=" + options.checkoutDate;

  var response = await fetch(url, apiOptions);
  var decodedResponse = await response.json();

  return decodedResponse.properties;
}

function renderHotels(regionName, hotels, numberOfHotelsToDisplay = 8) {
  emptyHotelContainers();

  var hotelContainerHeader = createHotelContainerHeader(regionName);
  $(hotelSearchLocationElement).append(hotelContainerHeader);

  for (var i = 0; i < numberOfHotelsToDisplay; ++i) {
    var hotelCard = createHotelCard(hotels[i]);

    $(hotelsBodyContainer).append(hotelCard);
  }
}

function createHotelCard(hotel) {
  var hotelContainer = $("<div>").addClass("box");

  var hotelTitle = $("<h5>")
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

function putPageIntoLoadingState() {
  showElement(loadingSpinnerContainer);
  hideElement(hotelsHeaderContainer);
  hideElement(hotelsBodyContainer);
  searchButton.disabled = true;

  scrollToElement(searchLoadingSpinnerContainer);

  loading = true;
}

function takePageOutOfLoadingState() {
  hideElement(loadingSpinnerContainer);
  showElement(hotelsHeaderContainer);
  showElement(hotelsBodyContainer);
  searchButton.disabled = false;

  loading = false;
}

function hideElement(element) {
  element.classList.add('d-none');
}

function showElement(element) {
  element.classList.remove('d-none');
}

function emptyElement(element) {
  element.innerHTML = '';
}

function emptyHotelContainers() {
  // emptyElement(hotelsHeaderContainer);
  emptyElement(hotelsBodyContainer);
  emptyElement(hotelSearchLocationElement);
}

function scrollToElement(element) {
  $('html, body').animate({
    scrollTop: $(element).offset().top
  }, 1000);
}

$(searchForm).on('submit', function (event) {
  event.preventDefault();
  searchLocationForHotels();
});

$(".dropdown-item").on("click", function (event) {
  // Update sortOrder when an item is clicked
  sortOrder = $(this).data("index");

  searchLocationForHotels({ sortOrder });
});