'use strict';

(function () {
   angular
      .module('MangaTradingApp', ['ngResource'])
      .controller('mangaCollectionController', ['$q', '$resource', '$scope', function ($q, $resource, $scope) {

         /***** INITIALIZE *****/
         $scope.loader = { isDeleting: false, isLoadingCollection: true, isUpdating: false };
         
         $scope.editIndex;
         $scope.searchTxt = '';
         $scope.selectedEditManga;
         $scope.user = {};
         
         var Manga = $resource('/api/manga');
         var User = $resource('/api/user');
         var UserManga = $resource(
            '/api/user/manga',
            {},
            { update: { method: 'PUT' } }
         );
            
         getUser();
         
         
         
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
                           $scope.user.manga[index].mangaDetails = res;
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
         
         $scope.checkVolumes = function (volumesDesc) {
            var lastChar = volumesDesc.slice(-1);
            if (/[,-]/.test(lastChar)) {
               alert('Your input must end with a number!');
               return;
            }
            
            var volumes = [];
            var volumesSplit = volumesDesc.split(',');
            
            for (var i = 0; i < volumesSplit.length; i++) {
               var currentVal = volumesSplit[i];
               
               if (/[-]/.test(currentVal)) {
                  
                  // compare left and right number of hyphened value
                  var hyphenedVal = currentVal.split('-');
                  var leftNum = Number(hyphenedVal[0]);
                  var rightNum = Number(hyphenedVal[1]);
                  
                  // prevent a right number starting with 0
                  if (hyphenedVal[1].charAt(0) === '0') {
                     alert('Your volume number should start with numbers 1-9. Your wrong input is "' + currentVal + '"');
                     return;
                  }
                  
                  if (leftNum > rightNum) {
                     alert('Left number should be less than the right number. Your wrong input is "' + currentVal + '"');
                     return;
                  } else {
                     // get indidual volumes from the range
                     for (var j = leftNum; j <= rightNum; j++) {
                        // prevent a number greater than 200
                        if (j > 200) {
                           alert('The maximum number you can have is 200. Your wrong input is "' + currentVal + '"');
                           return;
                        }
                        
                        volumes.push(j);
                     }
                  }
                  
               } else {
                  // prevent a number starting with 0
                  if (currentVal.charAt(0) === '0') {
                     alert('Your volume number should start with numbers 1-9. Your wrong input is "' + currentVal + '"');
                     return;
                  }
                  
                  var volumeNum = Number(currentVal);
                  
                  // prevent a number greater than 200
                  if (volumeNum > 200) {
                     alert('The maximum number you can input is 200. Your wrong input is "' + currentVal + '"');
                     return;
                  }
                  
                  volumes.push(volumeNum);
               }
            }
            
            volumes.sort(function (a, b) { return a - b; }); // sort volumes in ascending order
            edit(volumes.unique(), volumesDesc); // proceed to edit
         };
         
         $scope.editVolumesKeypress = function (e) {
            var keypressed = e.which || e.keyCode;

            if ((keypressed >=48 && keypressed <= 57) // digits
               || keypressed === 44 // comma
               || keypressed === 45 // hyphen
               || keypressed === 8 // backspace
               || keypressed === 13 // enter
               || keypressed === 27 // escape
               || (keypressed >= 35 && keypressed <= 40) // end, home, arrows
               || keypressed === 116 // f5
             ) {
               return true;
            } 
            
            e.preventDefault();
         };
         
         $scope.showEditModal = function (index) {
            $scope.editIndex = index;
            
            $scope.selectedEditManga = {
               mangaId: $scope.user.manga[index].mangaId,
               volumes: $scope.user.manga[index].volumes,
               volumesDesc: $scope.user.manga[index].volumesDesc
            };
            
            $('#editModal').modal('show');
         };
         
         $scope.volumesDescSpacing = function (data) {
            return data.replace(/,/g, ', ') ;
         };
         
         $scope.$watch('selectedEditManga.volumesDesc', function (newValue, oldValue) {
            if (newValue) {
               // rule for the first character
               if (newValue.length === 1) {
                  if (!/[1-9]/.test(newValue)) {
                     $scope.selectedEditManga.volumesDesc = $scope.selectedEditManga.volumesDesc.slice(0, -1);
                  }
               }  
               
               // rule for the first caracter of each csv
               var lastCsv = $scope.selectedEditManga.volumesDesc.split(',').pop();
               if (lastCsv.length === 1) {
                  if (!/[1-9]/.test(lastCsv)) {
                     $scope.selectedEditManga.volumesDesc = $scope.selectedEditManga.volumesDesc.slice(0, -1); 
                  }
               }  
                     
               var volumeRange = lastCsv.split('-');
               if (volumeRange.length > 2) {
                  $scope.selectedEditManga.volumesDesc = $scope.selectedEditManga.volumesDesc.slice(0, -1); // prevents more than one hyphen in a csv
               } else if (volumeRange.length === 2) {
                  var rightFirstDigit = volumeRange[1].split('').shift();
                  if (rightFirstDigit && rightFirstDigit === '0')
                     $scope.selectedEditManga.volumesDesc = $scope.selectedEditManga.volumesDesc.slice(0, -1); // 1st character of the right number should be a digit (1-9)
               }
                     
               if (oldValue) {
                  // prevent consecutive comma/hyphen
                  $scope.selectedEditManga.volumesDesc = $scope.selectedEditManga.volumesDesc
                     .replace(/,,/g, ',')
                     .replace(/--/g, '-')
                     .replace(/,-/g, ',')
                     .replace(/-,/g, '-');
               }
            }
         }, true);
         
         
         
         /***** MAIN FUNCTIONS *****/
         function edit (volumes, volumesDesc) {
            $('#editModal').modal('hide');
            
            $scope.loader.isUpdating = true;
            
            var data = { 
               mangaId: $scope.selectedEditManga.mangaId,
               volumes: volumes,
               volumesDesc: volumesDesc
            };
            
            UserManga.update(data).$promise.then(function () {
               alert('Manga updated!');
               location.reload();
            }, function (err) {
               console.log('UserManga.update error', err)
               if (err.status == 408)
                  alert('Oops! Something went wrong with your connection. Try again.')
            });
         }
         
         $scope.delete = function (index) {
            $scope.loader.isDeleting = true;
            
            UserManga.delete({ mangaId: $scope.user.manga[index].mangaId }).$promise.then(function () {
               alert('Manga deleted!');
               location.reload();
            }, function (err) {
               console.log('UserManga.delete error', err)
               if (err.status == 408)
                  alert('Oops! Something went wrong with your connection. Try again.')
            });
         };
         
         $scope.isMangaInCollection = function (selectedManga) {
            if (selectedManga.mangaId) {
               return $scope.user.manga.some(function (item) {
                  return item.mangaId === selectedManga.mangaId
               });   
            }
         };
      }]);
})();

Array.prototype.unique = function() {
	var n = {}, r = [];
	for (var i = 0; i < this.length; i++) {
		if (!n[this[i]]) {
			n[this[i]] = true; 
			r.push(this[i]); 
		}
	}
	return r;
}