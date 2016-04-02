(function () {
  'use strict';

  angular
    .module('permission')
    .service('StateAuthorization',
      /**
       * Service responsible for handling state based authorization
       * @class StateAuthorization
       * @memberOf permission
       *
       * @param $location {Object} Angular location helper service
       * @param $state {Object} Current state provider
       * @param PermissionMap {permission.PermissionMap} Map access rights
       * @param Authorization {permission.Authorization} Authorizing service
       * @param TransitionEvents {permission.TransitionEvents} Event management service
       * @param TransitionProperties {permission.TransitionProperties} Transition properties holder
       */
      function ($location, $state, PermissionMap, Authorization, TransitionEvents, TransitionProperties) {

        this.authorizeForState = authorizeForState;
        this.isAuthorizationFinished = isAuthorizationFinished;
        this.setStateAuthorizationStatus = setStateAuthorizationStatus;

        /**
         * Handles state authorization
         * @method
         */
        function authorizeForState() {
          var statePermissionMap = buildStatePermissionMap();

          Authorization
            .authorize(statePermissionMap)
            .then(function () {
              handleAuthorizedState();
            })
            .catch(function (rejectedPermission) {
              handleUnauthorizedState(statePermissionMap, rejectedPermission);
            })
            .finally(function () {
              setStateAuthorizationStatus(false);
            });
        }

        /**
         * Sets internal state `$$finishedAuthorization` variable to prevent looping
         * @method
         *
         * @param status {boolean} When true authorization has been already preceded
         */
        function setStateAuthorizationStatus(status) {
          angular.extend(TransitionProperties.toState, {'$$isAuthorizationFinished': status});
        }

        /**
         * Checks if state has been already checked for authorization
         * @method
         *
         * @returns {boolean}
         */
        function isAuthorizationFinished() {
          return TransitionProperties.toState.$$isAuthorizationFinished;
        }

        /**
         * Builds map of permissions resolving passed values to data.permissions and combine them with all its parents
         * keeping the order of permissions from the newest (children) to the oldest (parent)
         * @method
         * @private
         *
         * @returns {permission.PermissionMap} Permission map
         */
        function buildStatePermissionMap() {
          var permissionMap = new PermissionMap();

          var toStatePath = $state
            .get(TransitionProperties.toState.name)
            .$$state().path
            .slice()
            .reverse();

          toStatePath.forEach(function (state) {
            if (state.areSetStatePermissions()) {
              permissionMap.extendPermissionMap(new PermissionMap(state.data.permissions));
            }
          });

          return permissionMap;
        }

        /**
         * Handles redirection for authorized access
         * @method
         * @private
         */
        function handleAuthorizedState() {

          TransitionEvents.broadcastStateChangePermissionAccepted();
          $location.replace();

          $state
            .go(TransitionProperties.toState.name, TransitionProperties.toParams, {notify: false})
            .then(function () {
              TransitionEvents.broadcastStateChangeSuccess();
            });
        }

        /**
         * Handles redirection for unauthorized access
         * @method
         * @private
         *
         * @param permissionMap {permission.PermissionMap} Map of access rights names
         * @param rejectedPermission {String} Rejected access right
         */
        function handleUnauthorizedState(permissionMap, rejectedPermission) {
          TransitionEvents.broadcastStateChangePermissionDenied();

          permissionMap
            .resolveRedirectState(rejectedPermission)
            .then(function (redirect) {
              $state.go(redirect.state, redirect.params, redirect.options);
            });
        }

      });
})();
