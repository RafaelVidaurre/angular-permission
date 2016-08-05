'use strict';

/**
 * Handles authorization based on provided permissions/roles.
 * @name permission.permissionDirective
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
 * <div permission permission-sref="app.login"></div>
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
 *      permission-on-authorized="PermPermissionStrategies.disableElement"
 *      permission-on-unauthorized="PermPermissionStrategies.enableElement">
 * </div>
 *
 * @param $log {Object} Logging service
 * @param $injector {Object} Injector instance object
 * @param PermAuthorization {permission.PermAuthorization} PermAuthorization service
 * @param PermPermissionMap {permission.PermPermissionMap} Map of state access rights
 * @param PermPermissionStrategies {permission.PermPermissionStrategies} Set of pre-defined directive behaviours
 *
 * @returns {{
 *   restrict: string,
 *   bindToController: {
 *     sref: string
 *     only: string,
 *     except: string,
 *     onAuthorized: function,
 *     onUnauthorized: function
 *   },
 *   controllerAs: string,
 *   controller: controller
 * }} Directive instance
 */
function PermissionDirective($log, $injector, PermAuthorization, PermPermissionMap, PermPermissionStrategies) {
  'ngInject';

  return {
    restrict: 'A',
    bindToController: {
      sref: '=?permissionSref',
      only: '=?permissionOnly',
      except: '=?permissionExcept',
      onAuthorized: '&?permissionOnAuthorized',
      onUnauthorized: '&?permissionOnUnauthorized'
    },
    controllerAs: 'permission',
    controller: function ($scope, $element) {
      var permission = this;

      $scope.$watchGroup(['permission.only', 'permission.except', 'sref'],
        function () {
          try {
            var permissionMap;

            if (isSrefStateDefined()) {
              var $state = $injector.get('$state');
              var srefState = $state.get(permission.sref);

              permissionMap = new PermPermissionMap(srefState.data.permissions);
            } else {
              permissionMap = new PermPermissionMap({only: permission.only, except: permission.except});
            }

            PermAuthorization
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
       * Returns true when permissions should be checked based on state name
       * @private
       *
       * @returns {boolean}
       */
      function isSrefStateDefined() {
        return $injector.has('$state') && permission.sref;
      }

      /**
       * Calls `onAuthorized` function if provided or show element
       * @private
       */
      function onAuthorizedAccess() {
        if (angular.isFunction(permission.onAuthorized)) {
          permission.onAuthorized()($element);
        } else {
          PermPermissionStrategies.showElement($element);
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
          PermPermissionStrategies.hideElement($element);
        }
      }
    }
  };
}

angular
  .module('permission')
  .directive('permission', PermissionDirective);
