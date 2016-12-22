'use strict';

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
      .controller('mangaAddController', ['$resource', '$scope', function ($resource, $scope) {
         
         /***** INITIALIZE *****/
         $scope.loader = { isAdding: false, isDeleting: false, isLoadingManga: false };
         
         $scope.selectedManga;
         $scope.user = {};
         
         var Manga = $resource('/api/manga');
         var Search = $resource('/api/search/:q');
         var User = $resource('/api/user');
         var UserManga = $resource('/api/user/manga');
            
         getUser();
         
         
         
         /***** CONTROLLER FUNCTIONS *****/
         function generateVolumesDesc (volumes) {
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
         
         function getUser () {
            User.get().$promise.then(function (res) {
               $scope.user = res;
               
               $("#authorized-navbar").removeClass("hide");
            }, function (err) {
               // no user found
            })
         }
         
         $scope.addVolumesKeypress = function (e) {
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
         
         $scope.checkVolumes = function () {
            var lastChar = $scope.addVolumes.slice(-1);
            if (/[,-]/.test(lastChar)) {
               alert('Your input must end with a number!');
               return;
            }
            
            var volumes = [];
            var volumesSplit = $scope.addVolumes.split(',');
            
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
            add(volumes.unique(), generateVolumesDesc(volumes.unique())); // proceed to add
         };
         
         $scope.searchFocus = function () {
            if ($scope.selectedManga)
               $scope.searchTxt = '' ;
         };
         
         $scope.showAddModal = function () {
            $('#addModal').modal('show');
         };
         
         $scope.$watch('addVolumes', function (newValue, oldValue) {
            if (newValue) {
               // rule for the first character
               if (newValue.length === 1) {
                  if (!/[1-9]/.test(newValue)) {
                     $scope.addVolumes = $scope.addVolumes.slice(0, -1);
                  }
               }  
               
               // rule for the first caracter of each csv
               var lastCsv = $scope.addVolumes.split(',').pop();
               if (lastCsv.length === 1) {
                  if (!/[1-9]/.test(lastCsv)) {
                     $scope.addVolumes = $scope.addVolumes.slice(0, -1); 
                  }
               }  
                     
               var volumeRange = lastCsv.split('-');
               if (volumeRange.length > 2) {
                  $scope.addVolumes = $scope.addVolumes.slice(0, -1); // prevents more than one hyphen in a csv
               } else if (volumeRange.length === 2) {
                  var rightFirstDigit = volumeRange[1].split('').shift();
                  if (rightFirstDigit && rightFirstDigit === '0')
                     $scope.addVolumes = $scope.addVolumes.slice(0, -1); // 1st character of the right number should be a digit (1-9)
               }
                     
               if (oldValue) {
                  // prevent consecutive comma/hyphen
                  $scope.addVolumes = $scope.addVolumes
                     .replace(/,,/g, ',')
                     .replace(/--/g, '-')
                     .replace(/,-/g, ',')
                     .replace(/-,/g, '-');
               }
            }
         }, true);
         
         
         
         /***** MAIN FUNCTIONS *****/
         function add (volumes, volumesDesc) {
            $('#addModal').modal('hide');
            
            $scope.loader.isAdding = true;
            $scope.noResults = false;
            
            var newManga = { 
               mangaId: $scope.selectedManga.mangaId,
               volumes: volumes,
               volumesDesc: volumesDesc
            };
            
            UserManga.save({ newManga: newManga }).$promise.then(function () {
               $scope.loader.isAdding = false;
               
               $scope.addVolumes = '';
               
               $scope.user.manga.push(newManga);
               
               $(".alert-add").removeClass('hide');
               $(".alert-add").alert();
               $(".alert-add").fadeTo(2000, 500).slideUp(500, function(){
                  $(".alert-add").slideUp(500);
               });
            }, function (err) {
               console.log('UserManga.save error', err)
               if (err.status == 408)
                  alert('Oops! Something went wrong with your connection. Try again.')
            });
         }
         
         $scope.delete = function (index) {
            $scope.loader.isDeleting = true;
            
            UserManga.delete({ mangaId: $scope.selectedManga.mangaId }).$promise.then(function () {
               $scope.loader.isDeleting = false;
               
               $scope.user.manga.splice(index, 1);
               
               $(".alert-delete").removeClass('hide');
               $(".alert-delete").alert();
               $(".alert-delete").fadeTo(2000, 500).slideUp(500, function(){
                  $(".alert-delete").slideUp(500);
               });
            }, function (err) {
               console.log('UserManga.delete error', err)
               if (err.status == 408)
                  alert('Oops! Something went wrong with your connection. Try again.')
            });
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
         
         $scope.isMangaInCollection = function (selectedManga) {
            if (selectedManga.mangaId) {
               return $scope.user.manga.some(function (item) {
                  return item.mangaId === selectedManga.mangaId
               });   
            }
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