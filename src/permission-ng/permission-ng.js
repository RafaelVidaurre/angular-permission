(function (module) {
  'use strict';

  /**
   * @namespace permission.ng
   */

  function run($rootScope, $location, TransitionProperties, TransitionEvents, Authorization, PermissionMap) {
    'ngInject';

    /**
     * State transition interceptor
     */
    $rootScope.$on('$routeChangeStart', function (event, next, current) {

      if (areSetRoutePermissions() && !TransitionEvents.areEventsDefaultPrevented()) {
        setTransitionProperties();

        TransitionEvents.broadcastPermissionStartEvent();

        var permissionMap = new PermissionMap({
          only: next.$$route.data.permissions.only,
          except: next.$$route.data.permissions.except,
          redirectTo: next.$$route.data.permissions.redirectTo
        });

        Authorization
          .authorize(permissionMap)
          .then(function () {
            handleAuthorizedState();
          })
          .catch(function (rejectedPermission) {
            event.preventDefault();
            handleUnauthorizedState(rejectedPermission, permissionMap);
          });
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
       * Updates values of `TransitionProperties` holder object
       * @method
       * @private
       */
      function setTransitionProperties() {
        TransitionProperties.next = next;
        TransitionProperties.current = current;
      }

      /**
       * Handles redirection for authorized access
       * @method
       * @private
       */
      function handleAuthorizedState() {
        TransitionEvents.broadcastPermissionAcceptedEvent();
      }

      /**
       * Handles redirection for unauthorized access
       * @method
       * @private
       *
       * @param rejectedPermission {String} Rejected access right
       * @param permissionMap {permission.PermissionMap} State permission map
       */
      function handleUnauthorizedState(rejectedPermission, permissionMap) {
        TransitionEvents.broadcastPermissionDeniedEvent();

        permissionMap
          .resolveRedirectState(rejectedPermission)
          .then(function (redirect) {
            $location.path(redirect.state).replace();
          });
      }
    });
  }

  module.exports = angular
    .module('permission.ng', ['permission', 'ngRoute'])
    .run(run).name;

}(module || {}));
