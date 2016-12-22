'use strict';

(function () {
   angular
      .module('MangaTradingApp', ['ngResource'])
      .controller('tradeHistoryController', ['$http', '$q', '$resource', '$scope', '$timeout', function ($http, $q, $resource, $scope, $timeout) {
         
         /***** INITIALIZE *****/
         $scope.loader = { isAccepting: false, isDeclining: false, isLoadingData: true };
         
         $scope.receivedTradesDone = [], $scope.sentTradesDone = [];
         $scope.receivedTradesPending = [], $scope.sentTradesPending = [];
         $scope.user = {};
         
         var allTrades;
         var cities, provinces;
         var hasAccepted, hasDeclined;
         var promises = [];
         
         var Manga = $resource('/api/manga');
         var TradesByUser = $resource('/api/trade/user');
         var TradeUpdate = $resource(
            '/api/trade/update',
            {},
            { update: { method: 'PUT' } }
         );
         var User = $resource('/api/user');
            
         getLocation();
         getTradesByUser();
         getUser();
         
         $q.all(promises).then(function () {
            $scope.loader.isLoadingData = false;
         
            $timeout(function () {
               $('.nav-tabs').removeClass('hide');
               $('.tab-content').removeClass('hide');
            }, 1)
         
            generateTrades();
            getMangaDetails();
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
         
         function generateTrades () {
            allTrades.forEach(function (item) {
               if (item.to._id === $scope.user._id)
                  if (item.status === 'PENDING')
                     $scope.receivedTradesPending.push(item)
                  else
                     $scope.receivedTradesDone.push(item)
               else
                  if (item.status === 'PENDING')
                     $scope.sentTradesPending.push(item)
                  else
                     $scope.sentTradesDone.push(item)
            });
         }
         
         function getMangaDetails () {
            allTrades.forEach(function (item, index) {
               var mangaId = item.mangaId;
               var promises2 = [];
               
               promises2.push(Manga.get({ mangaId: mangaId }).$promise.then(function (res) {
                  allTrades[index].mangaDetails = res;
               }, function (err) {
                  console.log('Manga.get error', err)
               }));
               
               $q.all(promises2).then(function () {
                  initializeMasonry(); 
                  
                  // masonry bootstrap tab issue
                  $('a[data-toggle=tab]').on('shown.bs.tab', function (e) {
                     $('.manga-collection').masonry({ gutter: 0, itemSelector: '.manga-item' }); 
                  });
               }, function (err) {
                  console.log('$q.all 2 err', err)
               });
            });
         }
         
         function getTradesByUser () {
            promises.push(TradesByUser.get().$promise.then(function (res) {
               allTrades = res.trades;
            }, function (err) {
               console.log('TradesByUser.get error', err)
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
         
         function initializeMasonry () {
            var mangaCollection = $('.manga-collection').imagesLoaded( function() {
               mangaCollection.masonry({ itemSelector: '.manga-item' });
            });
         }
         
         function resetHelperVariables () {
            hasAccepted = false;
            hasDeclined = false;
         }
         
         $scope.convertDate = function (date) {
            var d = new Date(date);
            return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
         };
         
         
         $scope.generateVolumesDesc = function (volumes) {
            var isFindingRightNum;
            var previousValue = volumes[0];
            var volumesDesc = '' + volumes[0];
            
            for (var i = 1; i < volumes.length; i++) {
               var currentValue = volumes[i];
               
               if (previousValue + 1 === currentValue) {
                  if (!isFindingRightNum) { // start of finding the right number
                     isFindingRightNum = true;
                     volumesDesc += '-';
                  } else {
                     if (i === volumes.length - 1) // last index and still finding the right number
                        volumesDesc += currentValue;
                  }
               } else {
                  if (isFindingRightNum) { // previous number is the right number, current value can be added with a comma
                     isFindingRightNum = false;
                     volumesDesc += previousValue + ',' + currentValue;
                  } else { // normal comma separated value
                     volumesDesc += ',' + currentValue;   
                  }
               }
               
               previousValue = currentValue;
            }
            
            return volumesDesc;
         }
         
         $scope.getLocationLabel = function (citymunCode, provCode) {
            if (citymunCode && provCode && cities && provinces) {
               var cityIndex = cities.map(function (x) { return x.citymunCode; }).indexOf(citymunCode);
               var provinceIndex = provinces.map(function (x) { return x.provCode; }).indexOf(provCode);
               
               return cities[cityIndex].citymunDesc.toLowerCase() + ', ' + provinces[provinceIndex].provDesc.toLowerCase();      
            }
         };
         
         $scope.getVolumesRequested = function (volumes) {
            var str = '';
            volumes.forEach(function (item) {
               str += '#' + item + ', ';
            });
            str = str.slice(0, -2);
            return str;
         };
         
         $scope.volumesDescSpacing = function (data) {
            return data.replace(/,/g, ', ') ;
         };
         
         
         
         /***** CONTROLLER FUNCTIONS *****/
         $scope.accept = function (data) {
            $('html,body').scrollTop(0);
            
            $scope.loader.isAccepting = true;
            
            TradeUpdate.update({ id: data._id, newStatus: 'ACCEPTED' }, function (res) {
               alert('Request accepted!');
               location.reload();
            }, function (err) {
               console.log('TradeUpdate.update error', err)
            });
         };
         
         $scope.decline = function (data) {
            $('html,body').scrollTop(0);
            
            $scope.loader.isDeclining = true;
            
            TradeUpdate.update({ id: data._id, newStatus: 'DECLINED' }, function (res) {
               alert('Request accepted!');
               location.reload();
            }, function (err) {
               console.log('TradeUpdate.update error', err)
            });
         };
      }]);
})();