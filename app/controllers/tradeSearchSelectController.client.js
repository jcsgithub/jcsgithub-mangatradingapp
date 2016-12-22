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
      .controller('tradeSearchSelectController', ['$http', '$q', '$resource', '$scope', '$timeout', function ($http, $q, $resource, $scope, $timeout) {
         
         /***** INITIALIZE *****/
         $scope.loader = { isLoadingData: true, isSubmitting: false };
         
         $scope.manga = [], $scope.owners = [];
         $scope.selectedOwner, $scope.selectedVolumes = [];
         $scope.user = {};
         
         var cities, provinces;
         var mangaId = window.location.pathname.split('/').slice(3).join('/'); // get mangaId from current URL
         var promises = [], trades;
         
         var Manga = $resource('/api/manga');
         var MangaOwners = $resource('/api/manga/owners/:mangaId');
         var NewTrade = $resource('/api/trade/new');
         var TradesByManga = $resource('/api/trade/manga');
         var User = $resource('/api/user');
            
         getLocation();
         getMangaDetails();
         getMangaOwners();
         getTradesByManga();
         getUser();
         
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
         
         function getTradesByManga () {
            promises.push(TradesByManga.get({ mangaId: mangaId }).$promise.then(function (res) {
               trades = res.trades;
            }, function (err) {
               console.log('TradesByManga.get error', err)
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
            if (citymunCode && provCode && cities && provinces) {
               var cityIndex = cities.map(function (x) { return x.citymunCode; }).indexOf(citymunCode);
               var provinceIndex = provinces.map(function (x) { return x.provCode; }).indexOf(provCode);
               
               return cities[cityIndex].citymunDesc.toLowerCase() + ', ' + provinces[provinceIndex].provDesc.toLowerCase();      
            }
         };
         
         $scope.hasTrade = function (ownerId) {
            if (trades && trades.length)
               for (var i = 0; i < trades.length; i++) {
                  if (trades[i].to === ownerId)
                     return true;
               }
         };
         
         $scope.showRequestModal = function (owner) {
            $scope.selectedOwner = owner;
            $scope.selectedVolumes = [];
            $('#requestModal').modal('show'); 
         };
         
         $scope.volumesDescSpacing = function (data) {
            return data.replace(/,/g, ', ') ;
         };
         
         
         
         /***** CONTROLLER FUNCTIONS *****/
         $scope.submitRequest = function () {
            if ($scope.selectedVolumes.length) {
               $scope.selectedVolumes.sort(function (a, b) { return a - b; });
               
               $scope.loader.isSubmitting = true;
               $('html,body').scrollTop(0);
               $('#requestModal').modal('hide'); 
               
               var newTrade = {
                  mangaId: mangaId,
                  to: $scope.selectedOwner._id,
                  volumesRequested: $scope.selectedVolumes
               };
               
               NewTrade.save(newTrade, function (res) {
                  alert('Request submitted!');
                  location.reload();
               }, function (err) {
                  console.log('NewTrade.save err', err)
               });
            } else {
               $(".alert-warning").removeClass('hide');
               $(".alert-warning").alert();
               $(".alert-warning").fadeTo(2000, 500).slideUp(500, function(){
                  $(".alert-warning").slideUp(500);
               }); 
            }
         };
         
         $scope.toggleVolume = function (volume) {
            var index = $scope.selectedVolumes.indexOf(volume);
            
            if (index > -1) 
               $scope.selectedVolumes.splice(index, 1);
            else 
               $scope.selectedVolumes.push(volume);
         };
      }]);
})();