(function () {
  'use strict';

  angular
    .module('permission')
    .directive('permissionOnly', ['$log', 'Permission', function ($log, Permission) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          try {
            Permission
              .authorize({only: attrs.permissionOnly.replace(/\s/g, '').split(',')})
              .then(function () {
                element.removeClass('ng-hide');
              })
              .catch(function () {
                element.addClass('ng-hide');
              });
          } catch (e) {
            element.addClass('ng-hide');
            $log.error(e.message);
          }
        }
      };
    }])

    .directive('permissionExcept', ['$log', 'Permission', function ($log, Permission) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          try {
            Permission
              .authorize({except: attrs.permissionExcept.replace(/\s/g, '').split(',')})
              .then(function () {
                element.removeClass('ng-hide');
              })
              .catch(function () {
                element.addClass('ng-hide');
              });
          } catch (e) {
            element.addClass('ng-hide');
            $log.error(e.message);
          }
        }
      };
    }]);
}());
