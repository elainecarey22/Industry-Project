function getLight() {

$.ajax({
    type: 'GET',
    url: 'http://api.weatherunlocked.com/api/forecast/ie.H91?app_id=90b7901d&app_key=0c4da4ca6ded3f9ea285705055d53dc8',
    success: function(data) {
        var response = data.table
        var seaTemp = [];
        console.log(response)
      /*  $.each(response.rows, function(index, row) {
            var isoDate = new Date(row[0]);
            var jsdate = isoDate.getTime();
            rowForChart = [jsdate, row[4]];
            seaTemp.push(rowForChart);
        }) */
        //tempGraph(seaTemp);
    },
  });
};
