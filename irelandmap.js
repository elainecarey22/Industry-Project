/*
 ** A Mapbox tutorial provided the basis for the following map code
 */
// Wait until DOM content has loaded before initialising map
document.addEventListener('DOMContentLoaded', function() {
  // create MAP using access token and variable 'map'
  mapboxgl.accessToken = 'pk.eyJ1IjoiZWNhcmV5MjIiLCJhIjoiY2pzM2E3OG5qMjVrazN5bjF4M28xOWZzMiJ9.aDn2wTTUA-BvzMKGmAAcZg';
  // This adds the map to your page
  var map = new mapboxgl.Map({
    // container id specified in the HTML
    container: 'map',
    // style URL
    style: 'mapbox://styles/mapbox/outdoors-v11',
    // initial position in [lon, lat] format
    center: [-8, 53.7],
    // initial zoom
    zoom: 5.7
  });
  // populate map with beaches from geojson file
  map.on('load', function(e) {
    buildLocationList(beaches);
    // Add the data to map as a layer
    map.addSource('places', {
      type: 'geojson',
      data: beaches
    });
  });

  function buildLocationList(data) {
    // Iterate through the list of beaches
    for (i = 0; i < data.features.length; i++) {
      var currentFeature = data.features[i];
      // variable which holds properties from geojson file
      var info = currentFeature.properties;
      // Append a div to listings in the HTML with the class 'item' for each beach
      var listings = document.getElementById('listings');
      var listing = listings.appendChild(document.createElement('div'));
      listing.className = 'item';
      listing.id = 'listing-' + i;
      // Creates a new link with the class 'title' for each beach
      // add the name of the town that the beach is in
      var link = listing.appendChild(document.createElement('a'));
      link.href = '#';
      link.className = 'title';
      link.dataPosition = i;
      link.innerHTML = info.city;
      // Creates a new div with the class 'details' for each location
      // add the name of the county that the beach is in
      var details = listing.appendChild(document.createElement('div'));
      details.innerHTML = info.county;
      // add a marker for each location in the geojson file
      beaches.features.forEach(function(marker) {
        // Create a div element for the marker
        var el = document.createElement('div');
        // Add a class called 'marker' to each div
        el.className = 'marker';
        // Create the custom markers and add to map
        new mapboxgl.Marker(el, {
            offset: [0, -23]
          })
          // add the marker to the coordinates defined in the geojson file
          .setLngLat(marker.geometry.coordinates)
          .addTo(map);
        // add event listener for clicking markers on the map
        el.addEventListener('click', function(e) {
          var activeItem = document.getElementsByClassName('active');
          // Zoom in on marker
          flyToStore(marker);
          // Close all other popups and display popup for clicked location
          createPopUp(marker);
          // Highlight location in sidebar (and remove highlight for all other locations)
          e.stopPropagation();
          if (activeItem[0]) {
            activeItem[0].classList.remove('active');
          }
          // pass marker variable to refreshGraphs function
          refreshGraphs(marker);
        });
      });
      // variables to define the current markers long, lat and stationID
      // passed into functions which make the ajax requests
      function refreshGraphs(currentFeature) {
        long = currentFeature.geometry.coordinates[0]
        lat = currentFeature.geometry.coordinates[1]
        stationID = currentFeature.geometry.stationID
        refreshSalinity(long, lat);
        refreshTemp(long, lat);
        refreshHeight(stationID);
      }
      // zooms in on clicked marker
      function flyToStore(currentFeature) {
        map.flyTo({
          center: currentFeature.geometry.coordinates,
          zoom: 12.5
        });
      }
      // creates popup with whichever location is clicked
      function createPopUp(currentFeature) {
        var popUps = document.getElementsByClassName('mapboxgl-popup');
        // Check if there is already a popup on the map and if so, remove it
        if (popUps[0]) popUps[0].remove();
        var popup = new mapboxgl.Popup({
            closeOnClick: false
          })
          .setLngLat(currentFeature.geometry.coordinates)
          // add info from geojson file to the popup and add link to scroll down the page
          .setHTML('<h4>' + currentFeature.properties.city + ', ' + currentFeature.properties.county +
            '</h4>' + '<h5><a href="#forecast">' + 'Get Forecast' + '</a></h5>')
          .addTo(map);
        // add info from geojson file to the popup
        document.getElementById("currentLocation").innerHTML = currentFeature.properties.city + ', ' + currentFeature.properties.county
      }
      // Add an event listener for the links in the sidebar listing
      link.addEventListener('click', function(e) {
        // Update the currentFeature to the beach associated with the clicked link
        var clickedListing = data.features[this.dataPosition];
        //Fly to the point associated with the clicked link
        flyToStore(clickedListing);
        //Close all other popups and display popup for clicked store
        createPopUp(clickedListing);
        // get graph data for clicked location
        refreshGraphs(clickedListing);
        //Highlight listing in sidebar (and remove highlight for all other listings)
        var activeItem = document.getElementsByClassName('active');
        if (activeItem[0]) {
          activeItem[0].classList.remove('active');
        }
        this.parentNode.classList.add('active');
        document.getElementById("currentLocation").innerHTML = clickedListing.properties.city + ', ' + clickedListing.properties.county
      });
      // Add an event listener for when a user clicks on the map
      map.on('click', function(e) {
        // Query all the rendered points in the view
        var features = map.queryRenderedFeatures(e.point, {
          layers: ['locations']
        });

        if (features.length) {
          var clickedPoint = features[0];
          // 1. Fly to the marker
          flyToStore(clickedPoint);
          // 2. Close all other popups and display popup for clicked beach
          createPopUp(clickedPoint);
          // 3. Highlight beach in sidebar (and remove highlight for all other beach)
          var activeItem = document.getElementsByClassName('active');
          if (activeItem[0]) {
            activeItem[0].classList.remove('active');
          }
          // Find the index that corresponds to the clickedPoint that fired the event listener
          var selectedFeature = clickedPoint.properties.address;

          for (var i = 0; i < beaches.features.length; i++) {
            if (beaches.features[i].properties.address === selectedFeature) {
              selectedFeatureIndex = i;
            }
          }
          // Select the correct list item using the found index and add the active class
          var listing = document.getElementById('listing-' + selectedFeatureIndex);
          listing.classList.add('active');
        }
      }); //end event listener
    } // end iteration through list of beaches
  } // end buildLocationList()
}); // end document.addEventListener at beginning of page
/*
 ** End Mapbox tutorial code **
 ** event handler for collpasing sidebar
 */
$('#sidebarCollapse').on('click', function() {
  $('#sidebar').toggleClass('active');
});
/*
 ** function to return a 0 before month number
 ** needed for requesting months Jan - Sep
 */
Date.prototype.getFullMonth = function() {
  if (this.getMonth() < 10) {
    return '0' + (this.getMonth() + 1);
  }
  return this.getMonth();
};
/*
 ** function to return a 0 before date number
 ** needed for requesting dates 1-9
 */
Date.prototype.getFullDate = function() {
  if (this.getDate() < 10) {
    return '0' + (this.getDate());
  }
  return this.getDate();
};
// same function for hours 1-9
Date.prototype.getFullHour = function() {
  if (this.getHours() < 10) {
    return '0' + (this.getHours());
  }
  return this.getHours();
};
// same function for minutes 1-9
Date.prototype.getFullMinute = function() {
  if (this.getMinutes() < 10) {
    return '0' + (this.getMinutes());
  }
  return this.getMinutes();
};
// same function for seconds 1-9
Date.prototype.getFullSecond = function() {
  if (this.getSeconds() < 10) {
    return '0' + (this.getSeconds());
  }
  return this.getSeconds();
};
/*
 ** create current datetime object in format needed for AJAX call
 */
var today = new Date();
var current_month = today.getFullMonth();
var current_date = today.getFullDate();
var current_hour = today.getFullHour();
var current_minute = today.getFullMinute();
var current_second = today.getFullSecond();
var current_date = today.getFullYear() + '-' + current_month + '-' + current_date;
var current_time = current_hour + ":" + current_minute + ":" + current_second + 'Z';
var dateTime = current_date + 'T' + current_time;
console.log(dateTime);
/*
 ** do the same as above for 2 days from now
 */
var todaysDate = new Date();
todaysDate.setDate(todaysDate.getDate() + 1);
var this_month = todaysDate.getFullMonth();
var this_date = todaysDate.getFullDate();
var this_day = todaysDate.getFullYear() + '-' + this_month + '-' + this_date;
var dateTimePlusOne = this_day + 'T' + current_time;
// requests water salinity from server
function refreshSalinity(long, lat) {
  if (long == undefined) {
    long = '-9.08103515624996'
  }
  if (lat == undefined) {
    lat = '53.25048537234853'
  }
  $.ajax({
    type: 'GET',
    url: 'https://erddap.marine.ie/erddap/griddap/IMI_CONN_3D.json?Sea_water_salinity[(' + dateTime + '):1:(' + dateTimePlusOne + ')][(20.0):1:(20.0)][(' + lat + '):1:(' + lat + ')][(' + long + '):1:(' + long + ')]',
    success: (data) => {
      var response = data.table
      var salinity = [];
      console.log(response)
      $.each(response.rows, function(index, row) {
        var isoDate = new Date(row[0]);
        var jsdate = isoDate.getTime();
        rowForChart = [jsdate, row[4]];
        salinity.push(rowForChart);
      })
      // pass data to salinityGraph function in salinity.js
      salinityGraph(salinity);
    },
  });
};
// requests water temperature from server
function refreshTemp(long, lat) {
  if (long == undefined) {
    long = '-9.08103515624996'
  }
  if (lat == undefined) {
    lat = '53.25048537234853'
  }
  $.ajax({
    type: 'GET',
    url: 'https://erddap.marine.ie/erddap/griddap/IMI_CONN_3D.json?Sea_water_temperature[(' + dateTime + '):1:(' + dateTimePlusOne + ')][(20.0):1:(20.0)][(' + lat + '):1:(' + lat + ')][(' + long + '):1:(' + long + ')]',
    success: function(data) {
      var currentTemp = data.table.rows[0]
      var curTemp = currentTemp[4]
      console.log(curTemp);
      // round current temp to 2 decimal places
      var round = Math.round(curTemp * 100) / 100;
      // append to watertemp div to display current water temp
      document.getElementById("watertemp").innerHTML = round;
      var response = data.table
      var seaTemp = [];
      console.log(response)
      $.each(response.rows, function(index, row) {
        var isoDate = new Date(row[0]);
        var jsdate = isoDate.getTime();
        rowForChart = [jsdate, row[4]];
        seaTemp.push(rowForChart);
      })
      // pass data to tempGraph function in temperature.js
      tempGraph(seaTemp);
    },
  });
};
// requests tide heights from server
function refreshHeight(stationID) {
  if (stationID == undefined) {
    stationID = 'IESWBWC230_0000_0300_MODELLED'
  }
  $.ajax({
    type: 'GET',
    url: 'https://erddap.marine.ie/erddap/tabledap/IMI-TidePrediction_epa.json?time%2Csea_surface_height&time%3E=now&time%3C=now%2B2days&stationID=%22' + stationID + '%22&distinct()',
    success: function(data) {
      var currentTide = data.table.rows[0]
      var curT = currentTide[1]
      console.log(curT);
      // append current tide to currentT to display current tide height
      document.getElementById("currentT").innerHTML = curT;
      var response = data.table
      var tideHeight = [];
      var a = [];
      var t = [];
      console.log(response)

      $.each(response.rows, function(index, row) {
        //for chart
        var isoDate = new Date(row[0]);
        var jsdate = isoDate.getTime();
        rowForChart = [jsdate, row[1]];
        tideHeight.push(rowForChart);
      })
      //pass data to drawTable function in tideheight.js
      drawTable(tideHeight);
    },
  });
};
// requests sunrise and sunset times from weatherunlocked.com
$.ajax({
  type: 'GET',
  url: 'https://api.weatherunlocked.com/api/forecast/ie.H91?app_id=90b7901d&app_key=0c4da4ca6ded3f9ea285705055d53dc8',
  success: function(data) {
    var sunrise = data.Days[0].sunrise_time
    var sunset = data.Days[0].sunset_time;
    console.log(sunrise, sunset);
    document.getElementById("sunrise").innerHTML = sunrise;
    document.getElementById("sunset").innerHTML = sunset;
  },
});
