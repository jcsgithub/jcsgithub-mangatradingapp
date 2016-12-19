'use strict';

(function () {
   angular
      .module('MangaTradingApp', ['ngResource'])
      .controller('mangaCollectionController', ['$q', '$resource', '$scope', function ($q, $resource, $scope) {

         /***** INITIALIZE *****/
         $scope.loader = { isDeleting: false, isLoadingCollection: true };
         
         $scope.collection = [];
         $scope.searchTxt = '';
         $scope.selectedManga;
         $scope.user = {};
         
         var Manga = $resource('/api/manga');
         var User = $resource('/api/user');
         var UserManga = $resource(
            '/api/user/manga',
            {},
            { update: { method: 'PUT' } }
         );
            
         getUser ();
         
         
         
         /***** CONTROLLER FUNCTIONS *****/
         function getUser () {
            User.get().$promise.then(function (res) {
               $scope.user = res;
               
               $("#authorized-navbar").removeClass("hide");
               
               if (res && res.manga) {
                  var promises = [];
                  
                  // populate collection asynchronously
                  res.manga.forEach(function (item, index) {
                     (function (index) {
                        promises.push(Manga.get({ mangaId: item.mangaId }).$promise.then(function (res) {
                           $scope.collection[index] = res;
                        }, function (err) {
                           console.log('getMangaData error', err)
                           if (err.status == 408)
                              alert('Oops! Something went wrong with your connection. Try again.')
                        }));
                     })(index);
                  });   
                  
                  // initialize masonry after all promises are done
                  $q.all(promises).then(function () {
                     $scope.loader.isLoadingCollection = false;
                     initializeMasonry();
                  });
               } else {
                  $scope.noResultsFound = true;
               }
               
            }, function (err) {
               // no user found
            })
         }
         
         function initializeMasonry () {
            var mangaCollection = $('.manga-collection').imagesLoaded( function() {
               mangaCollection.masonry({ itemSelector: '.manga-item' });
            });
         }
         
         
         
         /***** MAIN FUNCTIONS *****/
         $scope.isMangaInCollection = function (selectedManga) {
            if (selectedManga.mangaId) {
               return $scope.user.manga.some(function (item) {
                  return item.mangaId === selectedManga.mangaId
               });   
            }
         };
      }]);
})();