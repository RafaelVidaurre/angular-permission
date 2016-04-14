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

      event.preventDefault();
      setTransitionProperties();

      if (!TransitionEvents.areEventsDefaultPrevented()) {
        TransitionEvents.broadcastPermissionStartEvent();

        var permissionMap = new PermissionMap();

        Authorization
          .authorize(permissionMap)
          .then(function () {
            handleAuthorizedState();
          })
          .catch(function (rejectedPermission) {
            handleUnauthorizedState(rejectedPermission, permissionMap);
          });
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
        $location.replace(next);
      }

      /**
       * Handles redirection for unauthorized access
       * @method
       * @private
       *
       * @param rejectedPermission {String} Rejected access right
       * @param statePermissionMap {permission.PermissionMap} State permission map
       */
      function handleUnauthorizedState(rejectedPermission, statePermissionMap) {
        TransitionEvents.broadcastPermissionDeniedEvent();

        statePermissionMap
          .resolveRedirectState(rejectedPermission)
          .then(function (redirect) {
            $location.replace(redirect);
          });
      }
    });
  }

  angular
    .module('permission.ng', ['permission', 'ngRoute'])
    .run(run);

}());
