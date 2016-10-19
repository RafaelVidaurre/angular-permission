'use strict';

/**
 * @namespace permission.ng
 */

/**
 * @param $rootScope {Object}
 * @param $location {Object}
 * @param PermTransitionProperties {permission.PermTransitionProperties}
 * @param PermTransitionEvents {permission.ng.PermTransitionEvents}
 * @param PermAuthorization {permission.PermAuthorization}
 * @param PermPermissionMap {permission.PermPermissionMap|Function}
 */
function run($rootScope, $location, PermTransitionProperties, PermTransitionEvents, PermAuthorization, PermPermissionMap) {
  'ngInject';

  /**
   * State transition interceptor
   */
  $rootScope.$on('$routeChangeStart', function (event, next, current) {
    setTransitionProperties();

    if (areSetRoutePermissions() && !PermTransitionEvents.areEventsDefaultPrevented()) {

      PermTransitionEvents.broadcastPermissionStartEvent();

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
      try {
        return !!next.$$route.data.permissions;
      } catch (e) {
        return false;
      }
    }

    /**
     * Updates values of `PermTransitionProperties` holder object
     * @method
     * @private
     */
    function setTransitionProperties() {
      PermTransitionProperties.next = next;
      PermTransitionProperties.current = current;
    }

    function permissionResolver() {
      var PermissionMap = new PermPermissionMap({
        only: next.$$route.data.permissions.only,
        except: next.$$route.data.permissions.except,
        redirectTo: next.$$route.data.permissions.redirectTo
      });

      var authorizationResult = PermAuthorization.authorizeByPermissionMap(PermissionMap);

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
      PermTransitionEvents.broadcastPermissionAcceptedEvent();
    }

    /**
     * Handles redirection for unauthorized access
     * @method
     * @private
     *
     * @param rejectedPermission {String} Rejected access right
     * @param permissionMap {permission.PermPermissionMap} State permission map
     */
    function handleUnauthorizedState(rejectedPermission, permissionMap) {
      PermTransitionEvents.broadcastPermissionDeniedEvent();

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