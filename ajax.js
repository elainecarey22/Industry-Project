$(document).ready(function() {
    //AJAX request to ERDDAP server for sea surface height
  function refreshHeight() {
    $.ajax({
        type: 'GET',
        url: 'https://erddap.marine.ie/erddap/tabledap/IMI-TidePrediction_epa.json?time%2Csea_surface_height&time%3E=now&time%3C=now%2B2days&stationID=%22IESWBWC230_0000_0300_MODELLED%22&distinct()',
        success: function(data) {
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

                var time = row[0];
                t.push(time);
                // store tide data in a variable
                var tide = row[1];
                // store this variable in array 'a'
                a.push(tide);
            })
            // pass data to drawTable function
            drawTable(tideHeight);

            // gets value for highest tide
            console.log(Math.max(...a));
            // gets index of highest tide in 'a'
            let i = a.indexOf(Math.max(...a));
            // prints index of high tide
            console.log(i);

            // gets value for lowest tide
            console.log(Math.min(...a));
            // gets index of lowest tide in 'a'
            let j = a.indexOf(Math.min(...a));
            // prints index of low tide
            console.log(j);

            var dateEvent1 = new Date(Date.parse(t[i])).toUTCString();
            var dateEvent2 = new Date(Date.parse(t[j])).toUTCString();

            document.getElementById("highTide1").innerHTML = dateEvent1;
            document.getElementById("lowTide1").innerHTML = dateEvent2;
        },
        // make AJAX call again after 10 minutes
        complete: function() {
          setTimeout(refreshHeight, 600000);
        }
      });
  };
/*
$.ajax({
  type: 'GET',
  crossOrigin: true,
  url: 'https://www.worldtides.info/api?extremes&lat=53.25048537234853&lon=-9.08103515624996&key=a191e4ed-8e98-4337-a922-94ca3d40d882',
  success: function(data) {
      var response = data.extremes[0]
      console.log(response)
      var highTdate = response.date
      var format = new Date(highTdate);
      var format2 = format.toLocaleTimeString("en-US");
      document.getElementById("highTide1").innerHTML = format2;

      var response2 = data.extremes[1]
      console.log(response2)
      var lowTdate = response2.date
      var format3 = new Date(lowTdate);
      var format4 = format3.toLocaleTimeString("en-US");
      document.getElementById("lowTide1").innerHTML = format4;

      var response3 = data.extremes[2]
      console.log(response3)
      var highTdate2 = response3.date
      var format5 = new Date(highTdate2);
      var format6 = format5.toLocaleTimeString("en-US");
      document.getElementById("highTide2").innerHTML = format6;
  }
});*/
/*
** function to return a 0 before month number
** needed for requesting months Jan - Sep
*/
Date.prototype.getFullMonth = function () {
   if (this.getMonth() < 10) {
       return '0' + (this.getMonth() + 1) ;
   }
   return this.getMonth();
};
/*
** function to return a 0 before date number
** needed for requesting dates 1-9
*/
Date.prototype.getFullDate = function () {
   if (this.getDate() < 10) {
       return '0' + (this.getDate()) ;
   }
   return this.getDate();
};
Date.prototype.getFullHour = function () {
   if (this.getHours() < 10) {
       return '0' + (this.getHours()) ;
   }
   return this.getHours();
};
Date.prototype.getFullMinute = function () {
   if (this.getMinutes() < 10) {
       return '0' + (this.getMinutes()) ;
   }
   return this.getMinutes();
};
Date.prototype.getFullSecond = function () {
   if (this.getSeconds() < 10) {
       return '0' + (this.getSeconds()) ;
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
var current_date = today.getFullYear()+'-'+ current_month +'-'+current_date;
var current_time = current_hour + ":" + current_minute + ":" + current_second + 'Z';
var dateTime = current_date+'T'+current_time;
console.log(dateTime);
/*
** create datetime object in format needed for AJAX call
** today plus two days
*/
var todaysDate = new Date();
todaysDate.setDate(todaysDate.getDate() + 1);
var this_month = todaysDate.getFullMonth();
var this_date = todaysDate.getFullDate();
var this_day = todaysDate.getFullYear()+'-'+ this_month +'-'+ this_date;
var dateTimePlusOne = this_day+'T'+current_time;

console.log(dateTimePlusOne);

    //AJAX request to ERDDAP server for sea surface temperature
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
            var response = data.table
            var seaTemp = [];
            console.log(response)
            $.each(response.rows, function(index, row) {
                var isoDate = new Date(row[0]);
                var jsdate = isoDate.getTime();
                rowForChart = [jsdate, row[4]];
                seaTemp.push(rowForChart);
            })
            tempGraph(seaTemp);
        },
        // make AJAX call again after 1 hour
        complete: function() {
          setTimeout(refreshTemp, 3600000);
        }
      });
    };

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
        salinityGraph(salinity);
      },
      // make AJAX call again after 1 hour
      complete: function() {
        setTimeout(refreshSalinity, 3600000);
      }
    });
  };
    //data for velocity accepted to page but not in correct format for graph
  /*$.ajax({
      type: 'GET',
      url: 'https://erddap.marine.ie/erddap/griddap/IMI_CONN_3D.json?sea_water_x_velocity[(2019-03-24T00:00:00Z):1:(2019-03-25T00:00:00Z)][(20.0):1:(20.0)][(53.25048537234853):1:(53.25048537234853)][(-9.08103515624996):1:(-9.08103515624996)],sea_water_y_velocity[(2019-03-24T00:00:00Z):1:(2019-03-25T00:00:00Z)][(20.0):1:(20.0)][(53.25048537234853):1:(53.25048537234853)][(-9.08103515624996):1:(-9.08103515624996)]',
      success: (data) => {
        var response = data.table
        var velocityV = [];
        console.log(response)
        $.each(response.rows, function(index, row) {
            var isoDate = new Date(row[4]);
            var jsdate = isoDate.getTime();
            rowForChart = [jsdate, row[5]];
            velocityV.push(rowForChart);
        })
        vCurrent(velocityV);
      }
    })*/
});
