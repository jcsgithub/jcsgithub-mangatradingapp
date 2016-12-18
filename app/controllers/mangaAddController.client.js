'use strict';

// bootstrap3-typeahead


(function () {
   angular
      .module('MangaTradingApp', ['ngResource', 'ui.bootstrap'])
      .directive('markdown', function () {
         var converter = new Showdown.converter();
         return {
            restrict: 'A',
            link: function (scope, element, attrs) {
               function renderMarkdown() {
                  var htmlText = converter.makeHtml(scope.$eval(attrs.markdown)  || 'No summary available.');
                  element.html(htmlText);
               }
               scope.$watch(attrs.markdown, renderMarkdown);
               renderMarkdown();
            }
         };
      })
      .controller('mangaAddController', ['$http', '$q', '$resource', '$scope', '$timeout', function ($http, $q, $resource, $scope, $timeout) {
         
         /***** INITIALIZE *****/
         $scope.loader = { isAdding: false, isDeleting: false, isLoadingManga: false };
         
         $scope.selectedManga;
         $scope.user = {};
         
         var cities = [], provinces = [];
         
         var Manga = $resource('/api/manga/:mangaId');
         var Search = $resource('/api/search/:q');
         var User = $resource(
            '/api/user',
            {},
            { update: { method: 'PUT' } }
         );
         
         getUser ();
         
         
         
         /***** CONTROLLER FUNCTIONS *****/
         function getUser () {
            User.get().$promise.then(function (res) {
               $scope.user = res;
               
               $("#authorized-navbar").removeClass("hide");
            }, function (err) {
               // no user found
            })
         }
         
         
         
         /***** USER INTERACTIONS *****/
         $scope.add = function () {
            $scope.loader.isAdding = true;
         };
         
         $scope.delete = function () {
            $scope.loader.isDeleting = true;
         };
         
         $scope.getManga = function (val) {
            return Search.get({ q: val }).$promise.then(function (res) {
               return res.data.map(function (manga){
                  return manga;
               });
            }, function (err) {
               console.log('Search.get error', err)
               if (err.status == 408)
                  alert('Oops! Something went wrong with your connection. Try again.')
            });
         };
         
         $scope.mangaSelected = function (item) {
            $scope.loader.isLoadingManga = true;
            
            $scope.selectedManga = null;
            
            Manga.get({ mangaId: item.mangaId }).$promise.then(function (res) {
               $scope.loader.isLoadingManga = false;
               $scope.selectedManga = res;
            }, function (err) {
               console.log('Manga.get error', err)
               if (err.status == 408)
                  alert('Oops! Something went wrong with your connection. Try again.')
            });
         };
      }]);
})();