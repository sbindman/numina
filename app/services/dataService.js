var app = angular.module("myApp")
    .service("dataService", ['$http', function ($http) {

        var service = {};

        service.getNuminaData = function (callback) {

            //grab data from numina api
           $http.get('https://api.numina.co/a/counts').
               //success callback
               then(function (response) {
                   callback(response);
               //error callback
               }, function (response) {
                    console.log('error with the numina api endpoint: ' + response);
                    callback(null);
               });
        };

        return service;
    }]);
