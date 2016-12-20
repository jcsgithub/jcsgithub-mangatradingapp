'use strict';

(function () {
   angular
      .module('MangaTradingApp', ['ngResource'])
      .controller('tradeSearchController', ['$q', '$resource', '$scope', function ($q, $resource, $scope) {

         /***** INITIALIZE *****/
         $scope.loader = { isLoadingData: true };
         
         $scope.manga = [];
         $scope.user = {};
         
         var Manga = $resource('/api/manga');
         var MangaUnique = $resource('/api/manga/unique');
         var User = $resource('/api/user');
            
         getUser();
         getUniqueManga();
         
         
         /***** CONTROLLER FUNCTIONS *****/
         function getUser () {
            User.get().$promise.then(function (res) {
               $scope.user = res;
               
               $("#authorized-navbar").removeClass("hide");
            }, function (err) {
               // no user found
            })
         }
         
         function getUniqueManga () {
            MangaUnique.get(function (res) {
               if (res && res.manga) {
                  var promises = [];
                  
                  // populate collection asynchronously
                  res.manga.forEach(function (item, index) {
                     (function (index) {
                        promises.push(Manga.get({ mangaId: item }).$promise.then(function (res) {
                           $scope.manga[index] = res;
                           $scope.manga[index].mangaId = item;
                        }, function (err) {
                           console.log('getMangaData error', err)
                           if (err.status == 408)
                              alert('Oops! Something went wrong with your connection. Try again.')
                        }));
                     })(index);
                  });   
                  
                  // initialize masonry after all promises are done
                  $q.all(promises).then(function () {
                     $scope.loader.isLoadingData = false;
                     initializeMasonry();
                  });
               } else {
                  $scope.noResultsFound = true;
               }
            }, function (err) {
               console.log('MangaUnique.get err', err)
            });     
         }
         
         function initializeMasonry () {
            var mangaCollection = $('.manga-collection').imagesLoaded( function() {
               mangaCollection.masonry({ itemSelector: '.manga-item' });
            });
         }
      }]);
})();