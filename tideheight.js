/*
** get current date & two days from now
** to display at the top of the graph
*/
var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
var initial = new Date();
var startDate = initial.toLocaleDateString("en-US", options);
initial.setDate(initial.getDate() + 2);
var endDate = initial.toLocaleDateString("en-US", options);

function drawTable(tideHeight) {
    Highcharts.chart('tide', {
        chart: {
            type: 'line',
            zoomType: 'x',
        },
        navigator: {
            adaptToUpdatedData: false,
            series: {
                data: tideHeight
            }
        },
        scrollbar: {
            liveRedraw: false
        },
        title: {
            text: 'Sea Surface Height'
        },
        subtitle: {
            text: startDate + ' - ' + endDate
        },
        xAxis: {
            type: 'datetime',
        },
        yAxis: {
            floor: -2.2
        },
        series: [{
            name: 'Sea Surface Height (m)',
            data: tideHeight,
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
