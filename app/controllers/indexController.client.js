'use strict';

(function () {
   angular
      .module('MangaTradingApp', ['ngResource'])
      .controller('indexController', ['$resource', '$scope', function ($resource, $scope) {
         
         /***** INITIALIZE *****/
         var User = $resource('/api/user');
         
         getUser();
         
         
         
         /***** CONTROLLER FUNCTIONS *****/
         function getUser () {
            User.get(function (res) {
               $scope.isLoggedIn = true;
               
               if (res._id) {
                  $("#authorized-navbar").removeClass("hide");
                  $("#unauthorized-navbar").addClass("hide");
               }
            }, function (err) {
               $("#authorized-navbar").addClass("hide");
               $("#unauthorized-navbar").removeClass("hide");
            });
         }
      }]);
})();