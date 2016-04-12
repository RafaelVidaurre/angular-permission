(function () {
  'use strict';

  /**
   * Handles authorization based on provided permissions/roles.
   * @name permissionDirective
   * @memberOf permission
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
   * You can override this behaviour by passing `permission-on-authorized` and `permission-on-unauthorized`
   *   attributes that will pass to your function `$element` as argument that you can freely manipulate your DOM
   *   behaviour.
   *
   * Important! Function should be as references - `vm.disableElement` not `vm.disableElement()` to be able to
   *   accept passed $element reference from inside of permissionDirective
   *
   * @example
   * <div permission
   *      permission-only="['USER','ADMIN']"
   *      permission-on-authorized="PermissionStrategies.disableElement"
   *      permission-on-unauthorized="PermissionStrategies.enableElement">
   * </div>
   *
   * @param $log {Object} Logging service
   * @param Authorization {permission.Authorization} Authorization service
   * @param PermissionMap {permission.PermissionMap} Map of state access rights
   * @param PermissionStrategies {permission.PermissionStrategies} Set of pre-defined directive behaviours
   *
   * @returns {Object} Directive instance
   */
  function permissionDirective($log, Authorization, PermissionMap, PermissionStrategies) {
    return {
      restrict: 'A',
      bindToController: {
        only: '=?permissionOnly',
        except: '=?permissionExcept',
        onAuthorized: '&?permissionOnAuthorized',
        onUnauthorized: '&?permissionOnUnauthorized',
        // Observing attribute `only` and `except` will be removed with version 2.4.0+
        deprecatedOnly: '=only',
        deprecatedExcept: '=except'
      },
      controllerAs: 'permission',
      controller: function ($scope, $element) {
        var permission = this;

        if (angular.isDefined(permission.deprecatedOnly) || angular.isDefined(permission.deprecatedExcept)) {
          $log.warn('Attributes "only" and "except" are deprecated since 2.2.0+ and their support ' +
            'will be removed from 2.4.0. Use scoped "permission-only" and "permission-except" instead.');
        }

        /**
         * Observing attribute `only` and `except` will be removed with version 2.4.0+
         */
        $scope.$watchGroup(['permission.only', 'permission.except',
            'permission.deprecatedOnly', 'permission.deprecatedExcept'],
          function () {
            try {
              var permissionMap = new PermissionMap({
                only: permission.only || permission.deprecatedOnly,
                except: permission.except || permission.deprecatedExcept
              });

              Authorization
                .authorize(permissionMap)
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
  }

  angular
    .module('permission')
    .directive('permission', permissionDirective);

}());
