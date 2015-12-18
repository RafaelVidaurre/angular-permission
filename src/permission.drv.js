(function () {
  'use strict';

  angular
    .module('permission')
    .directive('permission', ['$log', 'Permission', function ($log, Permission) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          try {
            Permission
              .authorize({
                only: scope.$eval(attrs.only),
                except: scope.$eval(attrs.except)
              }, null)
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
