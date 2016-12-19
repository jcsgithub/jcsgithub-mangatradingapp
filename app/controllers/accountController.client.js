'use strict';

(function () {
   angular
      .module('MangaTradingApp', ['ngResource'])
      .controller('accountController', ['$http', '$q', '$resource', '$scope', function ($http, $q, $resource, $scope) {
         
         /***** INITIALIZE *****/
         $scope.loader = { isSaving: false };
         
         $scope.locations = { city: [], province: [], region: [] };
         $scope.user = {};
         
         var cities = [], provinces = [];
         var User = $resource(
            '/api/user',
            {},
            { update: { method: 'PUT' } }
         );
         
         getInitialData ();
         
         
         
         /***** CONTROLLER FUNCTIONS *****/
         function getInitialData () {
            var src = 'https://raw.githubusercontent.com/clavearnel/philippines-region-province-citymun-brgy/master/json'
            
            $q.all([
               
               // get user
               User.get().$promise.then(function (res) {
                  $("#authorized-navbar").removeClass("hide");
                  
                  return(res);
               }, function (err) {
                  // no user found
               }),
               
               // get regions
               $http.get(src + '/refregion.json')
                  .then(function (res) {
                     $scope.locations.region = res.data.RECORDS;
                  }, function (err) {
                     console.log('regions err', err)
                  }),
                  
               // get provinces
               $http.get(src + '/refprovince.json')
                  .then(function (res) {
                     provinces = res.data.RECORDS;
                  }, function (err) {
                     console.log('provinces err', err)
                  }),
                  
               // get cities
               $http.get(src + '/refcitymun.json')
                  .then(function (res) {
                     cities = res.data.RECORDS;
                  }, function (err) {
                     console.log('cities err', err)
                  })
                  
            ]).then(function (res) {
               $('#form-loader').addClass('hidden');
               $('#form-account').removeClass('hidden');
               
               $scope.user = res[0];
               getCities();
               getProvinces();
            }, function (err) {
               console.log('$q.all err', err)
            });
         }
         
         $scope.provinceChanged = function () {
            // reset city
            $scope.locations.city = [];
            if ($scope.user.location && $scope.user.location.city)
               $scope.user.location.city = '';
            
            getCities();
         };
         
         $scope.regionChanged = function () {
            // reset province
            $scope.locations.province = [];
            if ($scope.user.location && $scope.user.location.province)
               $scope.user.location.province = '';
            
            getProvinces();
         };
         
         function getCities () {
            // populate city base on current province
            cities.forEach(function (item) {
               if ($scope.user.location.province == item.provCode)
                  $scope.locations.city.push(item);
            });
         }
         
         function getProvinces () {
            // populate province base on current region
            provinces.forEach(function (item) {
               if ($scope.user.location.region == item.regCode)
                  $scope.locations.province.push(item);
            });
         }

         
         
         /***** USER INTERACTIONS *****/
         $scope.save = function () {
            $scope.loader.isSaving = true;
            User.update($scope.user, function () {
               $scope.loader.isSaving = false;
               
               $(".alert-save").removeClass('hidden');
               $(".alert-save").alert();
               $(".alert-save").fadeTo(2000, 500).slideUp(500, function(){
                  $(".alert-save").slideUp(500);
               });  
            }, function (err) {
               console.log('User.update err', err)
            });
         };
      }]);
})();