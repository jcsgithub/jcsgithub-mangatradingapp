'use strict';

(function () {
   angular
      .module('MangaTradingApp', ['ngResource'])
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
         $scope.loader = { isAdding: false, isSearching: false };
         
         $scope.hasSearched = false;
         $scope.manga = [];
         $scope.searchTxt = '';
         $scope.user = {};
         
         var cities = [], provinces = [];
         
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
         $scope.add = function (mangaId) {
            
         };
         
         $scope.search = function (title) {
            $scope.hasSearched = true;
            $scope.loader.isSearching = true;
            
            $scope.manga = [];
            
            Search.get({ q: title }, function (res) {
               console.log('Search.get success', res.data)
               $scope.loader.isSearching = false;
               
               $scope.manga = res.data;
            }, function (err) {
               console.log('Search.get error', err)
            });
         };
      }]);
})();