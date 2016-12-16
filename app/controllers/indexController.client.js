'use strict';

(function () {
   angular
      .module('MangaTradingApp', ['ngResource'])
      .controller('indexController', ['$resource', '$scope', function ($resource, $scope) {
         
         /***** INITIALIZE *****/
         $scope.loader = { };
         
         $scope.isLoggedIn = false;
         $scope.userObject = {};
         
         var Search = $resource('/api/search/:q');
         var User = $resource('/api/user');
         
         getManga();
         getUser();
         
         
         
         /***** CONTROLLER FUNCTIONS *****/
         function getManga () {
            Search.get({ q: 'boku no' }, function (res) {
               console.log('Search.get success', res)
            }, function (err) {
               console.log('Search.get error', err)
            });
         }
         
         function getUser () {
            User.get(function (res) {
               console.log('User.get', res)
               
               $scope.isLoggedIn = true;
               $scope.userObject = res;
               
               if ($scope.userObject._id) {
                  $("#authorized-navbar").removeClass("hide");
                  $("#unauthorized-navbar").addClass("hide");
               }
            }, function (err) {
               $("#authorized-navbar").addClass("hide");
               $("#unauthorized-navbar").removeClass("hide");
            });
         }

         
         
         /***** USER INTERACTIONS *****/
         
      }]);
})();