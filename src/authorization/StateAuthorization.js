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

        this.authorize = authorize;

        /**
         * Handles state authorization
         * @method
         */
        function authorize() {
          var statePermissionMap = buildStatePermissionMap();

          return Authorization
            .authorize(statePermissionMap)
            .then(function () {
              handleAuthorizedState();
            })
            .catch(function (rejectedPermission) {
              handleUnauthorizedState(statePermissionMap, rejectedPermission);
            });
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

          // Overwrite notify option to broadcast it later
          TransitionProperties.options = angular.extend({}, TransitionProperties.options, {notify: false});

          $state
            .go(TransitionProperties.toState.name, TransitionProperties.toParams, TransitionProperties.options)
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
