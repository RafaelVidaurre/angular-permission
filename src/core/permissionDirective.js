(function () {
  'use strict';

  /**
   * Show/hide elements based on provided permissions/roles
   *
   * @example
   * <div permission only="'USER'"></div>
   * <div permission only="['USER','ADMIN']" except="'MANAGER'"></div>
   * <div permission except="'MANAGER'"></div>
   */
  angular
    .module('permission')
    .directive('permission', function ($log, Authorization, PermissionMap) {
      return {
        restrict: 'A',
        scope: true,
        bindToController: {
          only: '=',
          except: '='
        },
        controllerAs: 'permission',
        controller: function ($scope, $element, $attrs) {
          $scope.$watchGroup(['permission.only', 'permission.except'],
            function () {
              try {
                Authorization
                  .authorize(new PermissionMap({
                    only: $scope.$eval($attrs.only),
                    except: $scope.$eval($attrs.except)
                  }), null)
                  .then(function () {
                    $element.removeClass('ng-hide');
                  })
                  .catch(function () {
                    $element.addClass('ng-hide');
                  });
              } catch (e) {
                $element.addClass('ng-hide');
                $log.error(e.message);
              }
            });
        }
      };
    });
}());
