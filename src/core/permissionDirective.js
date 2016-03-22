(function () {
  'use strict';

  /**
   * Handles authorization based on provided permissions/roles.
   *
   * Directive accepts single or combined attributes `permission-only` and `permission-except` that checks on
   * DOM rendering if permissions/roles are met. Attributes can be passed either as String, Array or variable from
   * parent scope. Directive also will watch for changes if applied and automatically update the view.
   *
   * @example
   * <div permission
   *      permission-only="'USER'">
   * </div>
   * <div permission
   *      permission-only="['USER','ADMIN']"
   *      permission-except="'MANAGER'">
   * </div>
   *
   * By default directive will show/hide elements if provided permissions matches.
   * You can override this behaviour by passing `permission-on-authorized` and `permission-on-unauthorized` attributes
   * that will pass to your function `$element` as argument that you can freely manipulate your DOM behaviour.
   *
   * Important! Function should be as references - `vm.disableElement` not `vm.disableElement()` to be able to accept
   * passed $element reference from inside of permissionDirective
   *
   * @example
   * <div permission
   *      permission-only="['USER','ADMIN']"
   *      permission-on-authorized="PermissionStrategies.disableElement"
   *      permission-on-unauthorized="PermissionStrategies.enableElement">
   * </div>
   */
  angular
    .module('permission')
    .directive('permission', function ($log, Authorization, PermissionMap, PermissionStrategies) {
      return {
        restrict: 'A',
        scope: true,
        bindToController: {
          only: '=?permissionOnly',
          except: '=?permissionExcept',
          onAuthorized: '&?permissionOnAuthorized',
          onUnauthorized: '&?permissionOnUnauthorized'
        },
        controllerAs: 'permission',
        controller: function ($scope, $element, $attrs, $parse) {
          var permission = this;


          if (angular.isDefined($attrs.only) || angular.isDefined($attrs.except)) {
            $log.warn(
              'Attributes "only" and "except" are deprecated since 2.2.0+ and their support will be removed from 2.3.0. ' +
              'Use scoped "permission-only" and "permission-except" instead.');
          }

          /**
           * Observing attribute `only` will be removed with version 2.3.0+
           */
          $attrs.$observe('only', function (onlyString) {
            permission.only = $scope.$parent[onlyString] || $parse(onlyString);
          });

          /**
           * Observing attribute `except` will be removed with version 2.3.0+
           */
          $attrs.$observe('except', function (exceptString) {
            permission.except = $scope.$parent[exceptString] || $parse(exceptString);
          });

          $scope.$watchGroup(['permission.only', 'permission.except'],
            function () {
              try {
                Authorization
                  .authorize(new PermissionMap({
                    only: permission.only,
                    except: permission.except
                  }), null)
                  .then(function () {
                    onAuthorizedAccess();
                  })
                  .catch(function () {
                    onUnauthorizedAccess();
                  });
              } catch (e) {
                onUnauthorizedAccess();
                $log.error(e.message);
              }
            });

          /**
           * Calls `onAuthorized` function if provided or show element
           * @private
           */
          function onAuthorizedAccess() {
            if (angular.isFunction(permission.onAuthorized)) {
              permission.onAuthorized()($element);
            } else {
              PermissionStrategies.showElement($element);
            }
          }

          /**
           * Calls `onUnauthorized` function if provided or hide element
           * @private
           */
          function onUnauthorizedAccess() {
            if (angular.isFunction(permission.onUnauthorized)) {
              permission.onUnauthorized()($element);
            } else {
              PermissionStrategies.hideElement($element);
            }
          }
        }
      };
    });
}());
