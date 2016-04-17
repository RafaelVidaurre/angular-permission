(function () {
  'use strict';

  /**
   * @namespace permission.ng
   */

  function run($rootScope, $location, TransitionProperties, TransitionEvents, Authorization, PermissionMap) {
    /**
     * State transition interceptor
     */
    $rootScope.$on('$routeChangeStart', function (event, next, current) {

      if (areSetRoutePermissions()) {
        setTransitionProperties();

        if (!TransitionEvents.areEventsDefaultPrevented()) {
          TransitionEvents.broadcastPermissionStartEvent();

          var permissionMap = new PermissionMap({
            only: next.$$route.permissions.only,
            except: next.$$route.permissions.except,
            redirectTo: next.$$route.permissions.redirectTo
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
      }

      function areSetRoutePermissions(){
        return angular.isDefined(next.$$route.permissions);
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

  angular
    .module('permission.ng', ['permission', 'ngRoute'])
    .run(run);

}());
