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
         
         var Manga = $resource('/api/manga');
         var Search = $resource('/api/search/:q');
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
            }, function (err) {
               // no user found
            })
         }
         
         showAddModal();
         function showAddModal () {
            $('#addModal').modal('show');
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
         
         $scope.$watch('addVolumes', function(newValue, oldValue){
            // 1st character should be a digit
            if (newValue) 
               if (newValue.length === 1) 
                  if (!/[0-9]/.test(newValue)) 
                     $scope.addVolumes = '';
            
            // prevent consecutive comma/hyphen
            if (oldValue) 
               $scope.addVolumes = $scope.addVolumes
                  .replace(/,,/g, ',')
                  .replace(/--/g, '-')
                  .replace(/,-/g, ',')
                  .replace(/-,/g, '-');
         }, true);
         
         
         
         /***** USER INTERACTIONS *****/
         $scope.add = function () {
            $scope.loader.isAdding = true;
            
            UserManga.update({ mangaId: $scope.selectedManga.mangaId }).$promise.then(function () {
               $scope.loader.isAdding = false;
               
               $scope.user.manga.push($scope.selectedManga.mangaId);
               
               $(".alert-add").removeClass('hide');
               $(".alert-add").alert();
               $(".alert-add").fadeTo(2000, 500).slideUp(500, function(){
                  $(".alert-add").slideUp(500);
               });
            }, function (err) {
               console.log('UserManga.update error', err)
               if (err.status == 408)
                  alert('Oops! Something went wrong with your connection. Try again.')
            });
         };
         
         $scope.delete = function () {
            $scope.loader.isDeleting = true;
            
            UserManga.delete({ mangaId: $scope.selectedManga.mangaId }).$promise.then(function () {
               $scope.loader.isDeleting = false;
               
               var index = $scope.user.manga.indexOf($scope.selectedManga.mangaId);
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
         
         $scope.mangaSelected = function (item) {
            $scope.loader.isLoadingManga = true;
            
            $scope.selectedManga = null;
            
            Manga.get({ mangaId: item.mangaId }).$promise.then(function (res) {
               $scope.loader.isLoadingManga = false;
               $scope.selectedManga = res;
               console.log(res)
            }, function (err) {
               console.log('Manga.get error', err)
               if (err.status == 408)
                  alert('Oops! Something went wrong with your connection. Try again.')
            });
         };
      }]);
})();