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
      .controller('tradeSearchSelectController', ['$http', '$q', '$resource', '$scope', function ($http, $q, $resource, $scope) {
         
         /***** INITIALIZE *****/
         $scope.loader = { isLoadingData: true };
         
         $scope.manga = [], $scope.owners = [];
         $scope.user = {};
         
         var cities, provinces;
         var mangaId = window.location.pathname.split('/').slice(3).join('/'); // get mangaId from current URL
         var promises = [];
         
         var Manga = $resource('/api/manga');
         var MangaOwners = $resource('/api/manga/owners/:mangaId');
         var User = $resource('/api/user');
            
         getLocation();
         getUser();
         getMangaDetails();
         getMangaOwners();
         
         $q.all(promises).then(function () {
            $scope.loader.isLoadingData = false;
            initializeMasonry();
         }, function (err) {
            console.log('$q.all err', err)
         });
         
         
         
         /***** CONTROLLER FUNCTIONS *****/
         function getLocation () {
            var src = 'https://jcsgithub-mangatradingapp-jcsgithub.c9users.io/json';
            
            // get provinces
            promises.push($http.get(src + '/provinces')
               .then(function (res) {
                  provinces = res.data.RECORDS;
               }, function (err) {
                  console.log('provinces err', err)
               }));
               
            // get cities
            promises.push($http.get(src + '/cities')
               .then(function (res) {
                  cities = res.data.RECORDS;
               }, function (err) {
                  console.log('cities err', err)
               }));   
         }
         
         function getUser () {
            promises.push(User.get().$promise.then(function (res) {
               $scope.user = res;
               
               $("#authorized-navbar").removeClass("hide");
            }, function (err) {
               // no user found
            }));
         }
         
         function getMangaDetails () {
            promises.push(Manga.get({ mangaId: mangaId }).$promise.then(function (res) {
               if (!res.error)
                  $scope.manga = res;
               else
                  $scope.noResultsManga = true;
            }, function (err) {
               console.log('Manga.get error', err)
               if (err.status == 408)
                  alert('Oops! Something went wrong with your connection. Try again.')
            }));
         }
         
         function getMangaOwners () {
            promises.push(MangaOwners.get({ mangaId: mangaId }, function (res) {
               if (res.owners && res.owners.length)
                  $scope.owners = res.owners;
               else
                  $scope.noResultsOwners = true;
            }, function (err) {
               console.log('MangaOwners.get err', err)
            }));    
         }
         
         function initializeMasonry () {
            var mangaCollection = $('.manga-collection').imagesLoaded( function() {
               mangaCollection.masonry({ itemSelector: '.manga-item' });
            });
         }
         
         $scope.getLocationLabel = function (citymunCode, provCode) {
            var cityIndex = cities.map(function (x) { return x.citymunCode; }).indexOf(citymunCode);
            var provinceIndex = provinces.map(function (x) { return x.provCode; }).indexOf(provCode);
            
            return cities[cityIndex].citymunDesc.toLowerCase() + ', ' + provinces[provinceIndex].provDesc.toLowerCase();   
         };
         
         $scope.volumesDescSpacing = function (data) {
            return data.replace(/,/g, ', ') ;
         };
      }]);
})();