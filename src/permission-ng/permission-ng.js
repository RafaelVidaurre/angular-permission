'use strict';

/**
 * @namespace permission.ng
 */

/**
 * @param $rootScope {Object}
 * @param $location {Object}
 * @param permTransitionProperties {permission.permTransitionProperties}
 * @param permTransitionEvents {permission.permAuthorization}
 * @param permAuthorization {permission.permAuthorization}
 * @param permPermissionMap {permission.permPermissionMap}
 */
function run($rootScope, $location, permTransitionProperties, permTransitionEvents, permAuthorization, permPermissionMap) {
  'ngInject';

  /**
   * State transition interceptor
   */
  $rootScope.$on('$routeChangeStart', function (event, next, current) {

    if (areSetRoutePermissions() && !permTransitionEvents.areEventsDefaultPrevented()) {
      setTransitionProperties();

      permTransitionEvents.broadcastPermissionStartEvent();

      next.$$route.resolve = next.$$route.resolve || {};
      next.$$route.resolve.$$permission = permissionResolver;
    }

    /**
     * Checks if route has set permissions restrictions
     * @method
     * @private
     *
     * @returns {boolean}
     */
    function areSetRoutePermissions() {
      return angular.isDefined(next.$$route.data) && angular.isDefined(next.$$route.data.permissions);
    }

    /**
     * Updates values of `permTransitionProperties` holder object
     * @method
     * @private
     */
    function setTransitionProperties() {
      permTransitionProperties.next = next;
      permTransitionProperties.current = current;
    }

    function permissionResolver() {
      var PermissionMap = new permPermissionMap({
        only: next.$$route.data.permissions.only,
        except: next.$$route.data.permissions.except,
        redirectTo: next.$$route.data.permissions.redirectTo
      });

      var authorizationResult = permAuthorization.authorize(PermissionMap);

      authorizationResult
        .then(function () {
          handleAuthorizedState();
        })
        .catch(function (rejectedPermission) {
          handleUnauthorizedState(rejectedPermission, PermissionMap);
        });

      return authorizationResult;
    }

    /**
     * Handles redirection for authorized access
     * @method
     * @private
     */
    function handleAuthorizedState() {
      permTransitionEvents.broadcastPermissionAcceptedEvent();
    }

    /**
     * Handles redirection for unauthorized access
     * @method
     * @private
     *
     * @param rejectedPermission {String} Rejected access right
     * @param permissionMap {permission.permPermissionMap} State permission map
     */
    function handleUnauthorizedState(rejectedPermission, permissionMap) {
      permTransitionEvents.broadcastPermissionDeniedEvent();

      permissionMap
        .resolveRedirectState(rejectedPermission)
        .then(function (redirect) {
          $location.path(redirect.state).replace();
        });
    }
  });
}

var ngPermission = angular
  .module('permission.ng', ['permission', 'ngRoute'])
  .run(run);

if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = ngPermission.name;
}