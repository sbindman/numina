angular.module('myApp').controller('homeCtrl', function ($scope, dataService) {

    //whether or not to show pedestrians or cyclists
    $scope.showPedestrians = true;
    //whether or not to show data by hour or by 15 minute increments
    $scope.showHour = true;

    //function to grab numina data
    var getNuminaData = function() {
        dataService.getNuminaData(function(response) {
            //if receive valid data, store to visualize
            if (response != null) {
                //which class should be shown
                var classToShow = $scope.showPedestrians ? 'pedestrians' : 'bicyclists';

                //only show one class at a time, filter data
                var filteredData = _.filter(response.data.result, function(record) {
                    return record.class = classToShow;
                });
                //if show by hour, chart by hour
                if ($scope.showHour) {
                    $scope.showDataByHour(filteredData);
                }
                //else chart by 15 minutes
                else {
                 //todo show data by hour
                }
            }
            else {
                //todo error messaging
            }
        });
    };

    $scope.drawChart = function (data) {

        // //if there is an svg already, remove it
        // if (d3.select("svg")) {
        //     d3.select("svg").remove();
        // }

        var svg = d3.select("svg"),
            margin = {top: 20, right: 20, bottom: 30, left: 50},
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
                return y(d.count);
            });


        x.domain(d3.extent(data, function(d) {
            return d.time;
        }));
        y.domain(d3.extent(data, function(d) {
            return d.count;
        }));

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .select(".domain")
            .remove();

        g.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Pedestrian Count");

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line);
    };

    //visualize data by hour
    $scope.showDataByHour = function(data) {
        //empty object to store updated data
        var structuredData = {};
        //date format
        var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");
        //update date from string to date format
        _.each(data, function(d) {
            d.time = parseTime(new Date(d.time).toISOString());
        });

        //loop through data and aggregate data by hour, pedestrians and cyclists
        _.each(data, function(d) {
            //if hour already in object
            if (structuredData[d.time.getHours()]) {
                //if peds, up count
                if (d.class == 'pedestrian') {
                    structuredData[d.time.getHours()].pedestrians = structuredData[d.time.getHours()].pedestrians + d.count;
                }
                // if bikes, up count
                else {
                    structuredData[d.time.getHours()].bicyclists = structuredData[d.time.getHours()].bicyclists + d.count;
                }
            }
            //if hour not in object, add it
            else {
                structuredData[d.time.getHours()] = {};
                //if peds, up count
                if (d.class == 'pedestrian') {
                    structuredData[d.time.getHours()].pedestrians = d.count;
                    structuredData[d.time.getHours()].bicyclists = 0;
                }
                //if bicyclists, up count
                else {
                    structuredData[d.time.getHours()].pedestrians = 0;
                    structuredData[d.time.getHours()].bicyclists = d.count;
                }
            }
        });
        // draw chart of updated data
        $scope.drawChart(structuredData);
    };



    //function to draw raw data by seconds
    $scope.showDataBySecond = function(data) {
        var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");

        //update date
        _.each(data, function(d) {
            d.time = parseTime(new Date(d.time).toISOString());
        });

        $scope.drawChart(data);
    }


    getNuminaData();

});