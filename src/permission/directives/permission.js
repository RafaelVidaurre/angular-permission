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
 * <div permission permission-sref="'app.login'"></div>
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
 * @param PermPermissionMap {permission.permPermissionMap|Function} Map of state access rights
 * @param PermPermissionStrategies {permission.permPermissionStrategies} Set of pre-defined directive behaviours
 *
 * @returns {{
 *   restrict: string,
 *   bindToController: {
 *     sref: string
 *     only: string,
 *     except: string,
 *     event: string,
 *     onAuthorized: function,
 *     onUnauthorized: function
 *   },
 *   controllerAs: string,
 *   controller: controller
 * }} Directive instance
 */
function PermissionDirective($log, $injector, PermPermissionMap, PermPermissionStrategies) {
  'ngInject';

  return {
    restrict: 'A',
    bindToController: {
      sref: '=?permissionSref',
      only: '=?permissionOnly',
      except: '=?permissionExcept',
      event: '=?permissionEvent',
      onAuthorized: '&?permissionOnAuthorized',
      onUnauthorized: '&?permissionOnUnauthorized'
    },
    controllerAs: 'permission',
    controller: function ($scope, $element, $permission) {
      var permission = this;

      if (permission.event) {
        permission.stopEvent = $scope.$on(permission.event, checkPermission);
      }
      $scope.$watchGroup(['permission.only', 'permission.except', 'sref', 'event'],
        checkPermission);

      function checkPermission() {
        if (typeof permission.stopEvent === 'function') {
          permission.stopEvent();
          delete permission.stopEvent;
        }
        if (permission.event) {
          permission.stopEvent = $scope.$on(permission.event, checkPermission);
        }
        try {
          if (isSrefStateDefined()) {
            var PermStateAuthorization = $injector.get('PermStateAuthorization');

            PermStateAuthorization
              .authorizeByStateName(permission.sref)
              .then(function () {
                onAuthorizedAccess();
              })
              .catch(function () {
                onUnauthorizedAccess();
              });
          } else {
            var PermAuthorization = $injector.get('PermAuthorization');
            var permissionMap = new PermPermissionMap({only: permission.only, except: permission.except});

            PermAuthorization
              .authorizeByPermissionMap(permissionMap)
              .then(function () {
                onAuthorizedAccess();
              })
              .catch(function () {
                onUnauthorizedAccess();
              });
          }
        } catch (e) {
          onUnauthorizedAccess();
          $log.error(e.message);
        }
      }


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
          var onAuthorizedMethodName = $permission.defaultOnAuthorizedMethod;
          PermPermissionStrategies[onAuthorizedMethodName]($element);
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
          var onUnauthorizedMethodName = $permission.defaultOnUnauthorizedMethod;
          PermPermissionStrategies[onUnauthorizedMethodName]($element);
        }
      }

      $scope.$on('$destroy', function () {
        if (typeof permission.stopEvent === 'function') {
          permission.stopEvent();
        }
      });
    }
  };
}

angular
  .module('permission')
  .directive('permission', PermissionDirective);
