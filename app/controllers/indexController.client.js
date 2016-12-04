'use strict';

(function () {
   angular
      .module('VotingApp', ['ngResource'])
      .controller('indexController', ['$scope', '$resource', function ($scope, $resource) {
         
         /***** INITIALIZE *****/
         $scope.polls = [];
         
         var User = $resource('/api/user');
         var Polls = $resource('/api/polls');
         
         
         
         /***** CONTROLLER FUNCTIONS *****/
         function getUser () {
            User.get(function (res) {
               if (res.displayName !== null) {
                  $("#authorized-navbar").removeClass("hide");
                  $("#unauthorized-navbar").addClass("hide");
               }
            }, function (err) {
               $("#authorized-navbar").addClass("hide");
               $("#unauthorized-navbar").removeClass("hide");
            });
         };
         
         function getPolls () {
            Polls.get(function (res) {
               $scope.polls = res.data;
            }, function (err) {
               console.log('getPolls error', err);
               alert('Oops! Something went wrong. Try again later.');
            });
         }

         getUser();
         getPolls();
      }]);
})();