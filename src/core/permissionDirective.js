(function () {
  'use strict';

  /**
   * Show/hide elements based on provided permissions
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
        bindToController: {
          only: '=',
          except: '='
        },
        controllerAs: 'permission',
        controller: function ($element) {
          var permission = this;

          try {
            Authorization
              .authorize(new PermissionMap({
                only: permission.only,
                except: permission.except
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
        }
      };
    });
}());
