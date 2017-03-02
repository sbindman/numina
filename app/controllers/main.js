angular.module('myApp').controller('homeCtrl', function ($scope, dataService) {

    //whether or not to show pedestrian or cyclists
    $scope.showPedestrians = false;
    //whether or not to show data by hour or by 15 minute increments
    $scope.showHour = true;
    $scope.data = null;

    //toggle whether looking at pedestrians or cyclists
    $scope.togglePedestrian = function() {
        $scope.showPedestrians = !$scope.showPedestrians;

        //if show by hour, chart by hour
        if ($scope.showHour) {
            $scope.showDataByHour($scope.data);
        }
        //else chart by 15 minutes
        else {
            $scope.showDataByQuarterHour($scope.data);
        }
    };

    //toggle time interval
    $scope.toggleInterval = function() {
        $scope.showHour = !$scope.showHour;

        //if show by hour, chart by hour
        if ($scope.showHour) {
            $scope.showDataByHour($scope.data);
        }
        //else chart by 15 minutes
        else {
            $scope.showDataByQuarterHour($scope.data);
        }
    };

    // show data by hour
    $scope.showDataByHour = function(data) {
        //empty object to store updated data
        var structuredData = {};
        //empty array to pass to chart
        var dataToChart = [];

        parseTime = d3.timeParse("%H");

        //loop through data and aggregate data by hour, pedestrian and cyclists
        _.each(data, function(d) {
            var hour = parseTime(d.time.getHours());
            //if hour already in object
            if (structuredData[hour]) {
                //if peds, up count
                if (d.class == 'pedestrian') {
                    structuredData[hour].pedestrian = structuredData[hour].pedestrian + d.count;
                }
                // if bikes, up count
                else {
                    structuredData[hour].bicyclists = structuredData[hour].bicyclists + d.count;
                }
            }
            //if hour not in object, add it
            else {
                structuredData[hour] = {};
                structuredData[hour].time = hour;
                //if peds, up count
                if (d.class == 'pedestrian') {
                    structuredData[hour].pedestrian = d.count;
                    structuredData[hour].bicyclists = 0;
                }
                //if bicyclists, up count
                else {
                    structuredData[hour].pedestrian = 0;
                    structuredData[hour].bicyclists = d.count;
                }
            }
        });
        _.each(structuredData, function(e) {
            dataToChart.push(e);
        });
        // draw chart of updated data
        drawTable(dataToChart);
        // draw chart of updated data
        drawChart(dataToChart);
    };

    //visualize data by quarter hour
    $scope.showDataByQuarterHour = function(data) {

        //empty object to store updated data
        var structuredData = {};
        //empty array to pass to chart
        var dataToChart = [];
        //date format
        // var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");
        // //update date from string to date format
        // _.each(data, function(d) {
        //     d.time = parseTime(new Date(d.time).toISOString());
        // });

        parseTime = d3.timeParse("%H:%M");

        //loop through data and aggregate data by hour, pedestrian and cyclists
        _.each(data, function(d) {
            var hour = d.time.getHours();
            var minutes = d.time.getMinutes();
            var normalizedMinutes = (minutes < 15) ? '00' : (minutes < 30) ? '15' : (minutes < 45) ? '30' : '45';
            var time = parseTime(hour + ':' + normalizedMinutes);

            //if hour already in object
            if (structuredData[time]) {
                //if peds, up count
                if (d.class == 'pedestrian') {
                    structuredData[time].pedestrian = structuredData[time].pedestrian + d.count;
                }
                // if bikes, up count
                else {
                    structuredData[time].bicyclists = structuredData[time].bicyclists + d.count;
                }
            }
            //if hour not in object, add it
            else {
                structuredData[time] = {};
                //if peds, up count
                if (d.class == 'pedestrian') {
                    structuredData[time].pedestrian = d.count;
                    structuredData[time].bicyclists = 0;
                }
                //if bicyclists, up count
                else {
                    structuredData[time].pedestrian = 0;
                    structuredData[time].bicyclists = d.count;
                }
                structuredData[time].time = time;
            }
        });
        _.each(structuredData, function(e) {
            dataToChart.push(e);
        });
        // draw chart of updated data
        drawChart(dataToChart);
        //update table
        drawTable(dataToChart);
    };

    //function to grab numina data
    var getNuminaData = function() {
        dataService.getNuminaData(function(response) {
            //if receive valid data, store to visualize
            if (response != null) {
                //save data
                $scope.data = response.data.result;

                //date format
                var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");
                //update date from string to date format
                _.each($scope.data, function(d) {
                    d.time = parseTime(new Date(d.time).toISOString());
                });

                //if show by hour, chart by hour
                if ($scope.showHour) {
                    $scope.showDataByHour($scope.data);
                }
                //else chart by 15 minutes
                else {
                    $scope.showDataByQuarterHour($scope.data);
                }
            }
            else {
                //todo error messaging
            }
        });
    };

    //function to draw d3 chart
    var drawChart = function (data) {

        //which class should be shown
        var classToShow = $scope.showPedestrians ? 'pedestrian' : 'bicyclists';

        //if there is an svg already, remove it
        $('#chart').empty();

        var svg = d3.select("svg"),
            margin = {top: 20, right: 20, bottom: 20, left: 50},
            width = +svg.attr("width") - margin.left - margin.right,
            height = +svg.attr("height") - margin.top - margin.bottom,
            g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        var x = d3.scaleTime()
            .rangeRound([0, width]);

        var y = d3.scaleLinear()
            .rangeRound([height, 0]);

        var line = d3.line()
            .x(function(d) {
                return x(d.time);
            })
            .y(function(d) {
                return y(d[classToShow]);
            });


        x.domain(d3.extent(data, function(d) {
            return d.time;
        }));

        y.domain([0, d3.max(data, function(d) {
            return d[classToShow];
        })]);

        // y.domain([0, _.max(data, function(d){ return d[classToShow] })]);

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));



        g.append("g")
            .call(d3.axisLeft(y)
                .ticks(5)
            )
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text(classToShow  + " count");

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#222222")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .style("stroke-dasharray", ("3, 3"))
            .attr("stroke-width", 1)
            .attr("d", line);

        //add data dots
        g.selectAll("dot")
            .data(data)
            .enter().append("circle")
            .attr("r", 5)
            .attr("fill", "#4db9e0")
            .attr("cx", function(d) { return x(d.time); })
            .attr("cy", function(d) { return y(d[classToShow]); });
    };

    //draw table
    var drawTable = function(data){
        if (!$scope.showHour) {

            //which class should be shown
            var classToShow = $scope.showPedestrians ? 'pedHourTotal' : 'bikeHourTotal';

            //calculate running hour total
            _.each(data, function (d, i) {
                //if an hour of data exists
                if (i >= 3) {
                    d.pedHourTotal = data[i].pedestrian + data[i - 1].pedestrian + data[i - 2].pedestrian + data[i - 3].pedestrian;
                    d.bikeHourTotal = data[i].bicyclists + data[i - 1].bicyclists + data[i - 2].bicyclists + data[i - 3].bicyclists;
                }
                else {
                    d.pedHourTotal = null;
                    d.bikeHourTotal = null;
                }
            });
            var max = data[0][classToShow];
            var maxI = 0;
            _.each(data, function(d, i) {
                if (d[classToShow] > max) {
                    max = d[classToShow];
                    maxI = i;
                }
            });

            //add attribute for max
            data[maxI].max = true;
            data[maxI - 1 ].max = true;
            data[maxI - 2].max = true;
            data[maxI - 3].max = true;

            //find the max to update styling in UI
            var m = _.max(data, function(d) {
                return d[classToShow];
            });
        }


        $scope.tableData = data;
    };

    getNuminaData();

});