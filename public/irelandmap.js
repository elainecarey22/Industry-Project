/*
 ** A Mapbox tutorial provided the basis for the following map code
 */
// Wait until DOM content has loaded before initialising map
document.addEventListener('DOMContentLoaded', function () {
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

  // Add zoom and rotation controls to the bottom right of the map
  map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

  // populate map with beaches from geojson file
  map.on('load', function (e) {
    //buildLocationList(beaches);
    buildSidebar(beaches);
    // Add the data to map as a layer
    map.addSource('places', {
      type: 'geojson',
      data: beaches,
      // new code added 27th May      
      cluster: true,
      clusterRadius: 30,
      clusterMaxZoom: 12
    }); // end addSource

    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'places',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          "#2C69E5",
          100,
          "#f1f075",
          750,
          "#f28cb1"
        ],
        "circle-radius": [
          "step",
          ["get", "point_count"],
          20,
          100,
          30,
          750,
          40
        ]
      }
    }); // end addLayer

    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "places",
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12
      }
    }); // end addLayer

    map.addLayer({
      id: "unclustered-point",
      type: "circle",
      source: "places",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "#2C69E5",
        "circle-radius": 9,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff"
      }
    }); // end addLayer

    // inspect a cluster on click
    map.on('click', 'clusters', function (e) {
      var features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      var clusterId = features[0].properties.cluster_id;
      console.log(clusterId);
      map.getSource('places').getClusterExpansionZoom(clusterId, function (err, zoom) {
        if (err)
          return;

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom
        });
      });
    }); // end clusters onclick event

    map.on('click', 'unclustered-point', function (data) {
      // Iterate through the list of beaches
      for (i = 0; i < data.features.length; i++) {
        var currentFeature = data.features[i];
        // Update the currentFeature to the beach associated with the clicked link
        console.log(currentFeature);
        //Fly to the point associated with the clicked link
        flyToStore(currentFeature);
        //Close all other popups and display popup for clicked store
        createPopUp(currentFeature);
        // get graph data for clicked location
        refreshGraphs(currentFeature);
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
            closeOnClick: true
          })
            .setLngLat(currentFeature.geometry.coordinates)
            // add info from geojson file to the popup and add link to scroll down the page
            .setHTML('<h4>' + currentFeature.properties.city + ', ' + currentFeature.properties.county +
              '</h4>' + '<h5><a href="#forecast">' + 'Get Forecast' + '</a></h5>')
            .addTo(map);
          // add info from geojson file to the popup
          document.getElementById("currentLocation").innerHTML = currentFeature.properties.city + ', ' + currentFeature.properties.county
        }
      }
    }); // end unclustered-point onclick event

    // change format of mouse when hovering over cluster
    map.on('mouseenter', 'clusters', function () {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', function () {
      map.getCanvas().style.cursor = '';
    });
  }); // end map on load function

  function buildSidebar(data) {
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
      link.addEventListener('click', function (e) {
        // Update the currentFeature to the beach associated with the clicked link
        var clickedListing = data.features[this.dataPosition];
        console.log(clickedListing);
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
        document.getElementById('currentLocation').innerHTML = clickedListing.properties.city + ', ' + clickedListing.properties.county
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
          closeOnClick: true
        })
          .setLngLat(currentFeature.geometry.coordinates)
          // add info from geojson file to the popup and add link to scroll down the page
          .setHTML('<h4>' + currentFeature.properties.city + ', ' + currentFeature.properties.county +
            '</h4>' + '<h5><a href="#forecast">' + 'Get Forecast' + '</a></h5>')
          .addTo(map);
        // add info from geojson file to the popup
        document.getElementById("currentLocation").innerHTML = currentFeature.properties.city + ', ' + currentFeature.properties.county
      }
    }
  } // end buildSidebar() 
}); // end document.addEventListener at beginning of page
/*
 ** End Mapbox tutorial code **
 ** event handler for collpasing sidebar
 */
$('#sidebarCollapse').on('click', function () {
  $('#sidebar').toggleClass('active');
});
/*
 ** formatting datetime objects to comply with request string
 ** startTime takes away 1 hour from the current time
 ** endTime takes one hour away from current time and adds a day
 */
var startTime = JSON.stringify(new Date(new Date().getTime() - (60*60*1000))).substring(1,24);
var add = new Date();
var endTime = JSON.stringify(new Date(add.getTime() -(60*60*1000) +(24*60*60*1000))).substring(1, 24);
console.log(startTime);
console.log(endTime);

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
    url: 'https://erddap.marine.ie/erddap/griddap/IMI_CONN_3D.json?Sea_water_salinity[(' + startTime + '):1:(' + endTime + ')][(20.0):1:(20.0)][(' + lat + '):1:(' + lat + ')][(' + long + '):1:(' + long + ')]',
    success: (data) => {
      var response = data.table
      var salinity = [];
      console.log(response)
      $.each(response.rows, function (index, row) {
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
    url: 'https://erddap.marine.ie/erddap/griddap/IMI_CONN_3D.json?Sea_water_temperature[(' + startTime + '):1:(' + endTime + ')][(20.0):1:(20.0)][(' + lat + '):1:(' + lat + ')][(' + long + '):1:(' + long + ')]',
    success: function (data) {
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
      $.each(response.rows, function (index, row) {
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
    stationID = 'IEWEBWC170_0000_0200_MODELLED'
  }
  $.ajax({
    type: 'GET',
    url: 'https://erddap.marine.ie/erddap/tabledap/IMI-TidePrediction_epa.json?time%2Csea_surface_height&time%3E=now&time%3Cnow%2B2days&stationID=%22' + stationID + '%22&distinct()',
    success: function (data) {
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

      $.each(response.rows, function (index, row) {
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
  success: function (data) {
    var sunrise = data.Days[0].sunrise_time
    var sunset = data.Days[0].sunset_time;
    console.log(sunrise, sunset);
    document.getElementById("sunrise").innerHTML = sunrise;
    document.getElementById("sunset").innerHTML = sunset;
  },
});