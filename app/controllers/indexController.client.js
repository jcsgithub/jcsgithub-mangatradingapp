'use strict';

(function () {
   angular
      .module('MangaTradingApp', ['ngResource'])
      .controller('indexController', ['$resource', '$scope', function ($resource, $scope) {
         
         /***** INITIALIZE *****/
         $scope.loader = { };
         
         $scope.isLoggedIn = false;
         $scope.userObject = {};
         
         var User = $resource('/api/user');
         
         getUser();
         
         
         
         /***** CONTROLLER FUNCTIONS *****/
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
         
         function getMangaOwners () {
            var MangaOwners = $resource('/api/manga/owners/:mangaId');
            MangaOwners.get({ mangaId: 'one-piece' }, function (res) {
               console.log('MangaOwners.get', res.owners)
            }, function (err) {
               console.log('MangaOwners.get err', err)
            });  
         }

         
         
         /***** USER INTERACTIONS *****/
         
      }]);
})();