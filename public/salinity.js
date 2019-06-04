Highcharts.setOptions({
    time: {
        /**
         * Use moment-timezone.js to return the timezone offset for individual
         * timestamps, used in the X axis labels and the tooltip header.
         */
        getTimezoneOffset: function (timestamp) {
            var zone = 'Europe/Dublin',
                timezoneOffset = -moment.tz(timestamp, zone).utcOffset();

            return timezoneOffset;
        }
    }
});
/*
** Dates to display at the top of the graph
*/
var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
var initial = new Date();
var startDate = initial.toLocaleDateString("en-US", options);
initial.setDate(initial.getDate() + 1);
var endDate = initial.toLocaleDateString("en-US", options);

function salinityGraph(salinity) {
    Highcharts.chart('sal', {
        chart: {
            type: 'line',
            zoomType: 'x',
        },
        navigator: {
            adaptToUpdatedData: false,
            series: {
                data: salinity
            }
        },
        tooltip: {
            crosshairs: true,
            valueDecimals: 1
        },
        scrollbar: {
            liveRedraw: false
        },
        title: {
            text: 'Water Salinity'
        },
        subtitle: {
            text: startDate + ' - ' + endDate
        },
        xAxis: {
            type: 'datetime',
        },
        yAxis: {
            floor: 0
        },
        series: [{
            name: 'Water Salinity (PSU)',
            data: salinity,
            dataGrouping: {
                enabled: false
            }
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }
    })
}
