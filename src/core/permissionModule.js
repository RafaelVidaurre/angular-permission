(function () {
  'use strict';

  var permission = angular.module('permission', ['ui.router']);

  /**
   * This decorator is required to access full state object instead of it's configuration
   * when trying to obtain full toState state object not it's configuration
   * Can be removed when implemented https://github.com/angular-ui/ui-router/issues/13.
   */
  permission.config(function ($stateProvider) {
    $stateProvider.decorator('parent', function (state, parentFn) {
      state.self.getState = function () {
        return state;
      };
      return parentFn(state);
    });
  });

  permission.run(function ($rootScope, $state, $q, Authorization, PermissionMap) {
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {

      if (areSetStatePermissions(toState)) {
        setStateAuthorizationStatus(true);
        event.preventDefault();

        if (!areStateEventsDefaultPrevented()) {
          var compensatedPermissionMap = compensatePermissionMap(toState.data.permissions);
          authorizeForState(compensatedPermissionMap);
        }
      } else {
        setStateAuthorizationStatus(false);
      }

      /**
       * Checks if state is qualified to be permission based verified
       *
       * @returns {boolean}
       */
      function areSetStatePermissions(state) {
        return !(state.$$isAuthorizationFinished) && state.data && state.data.permissions;
      }

      /**
       * Sets internal state `$$finishedAuthorization` variable to prevent looping
       *
       * @param status {boolean} When true authorization has been already preceded
       */
      function setStateAuthorizationStatus(status) {
        toState = angular.extend({'$$isAuthorizationFinished': status}, toState);
      }

      /**
       * Checks if state events are not prevented by default
       *
       * @returns {boolean}
       */
      function areStateEventsDefaultPrevented() {
        return isStateChangePermissionStartDefaultPrevented() || isStateChangeStartDefaultPrevented();
      }

      /**
       * Builds map of permissions resolving passed values to data.permissions and combine them with all its parents
       * keeping the order of permissions from the newest (children) to the oldest (parent)
       *
       * @param statePermissionMap {Object} Current state permission map
       * @returns {{only: Array, except: Array}} Permission map
       */
      function compensatePermissionMap(statePermissionMap) {
        var permissionMap = new PermissionMap({redirectTo: statePermissionMap.redirectTo});

        var toStatePath = $state
          .get(toState.name)
          .getState()
          .path.reverse();

        angular.forEach(toStatePath, function (state) {
          if (areSetStatePermissions(state.self)) {
            permissionMap.extendPermissionMap(new PermissionMap(state.self.data.permissions));
          }
        });

        return permissionMap;
      }

      /**
       * Handles state authorization
       *
       * @param permissions {Object} Map of "only" or "except" permission names
       */
      function authorizeForState(permissions) {
        Authorization
          .authorize(permissions, toParams)
          .then(function () {
            $rootScope.$broadcast('$stateChangePermissionAccepted', toState, toParams, options);
            goToState(toState.name);
          })
          .catch(function (rejectedPermission) {
            $rootScope.$broadcast('$stateChangePermissionDenied', toState, toParams, options);
            permissions.redirectToState(rejectedPermission);
          });
      }

      /**
       * Redirects to states when permissions are met
       *
       * If authorized, use call state.go without triggering the event.
       * Then trigger $stateChangeSuccess manually to resume the rest of the process
       * Note: This is a pseudo-hacky fix which should be fixed in future ui-router versions
       */
      function goToState(name) {
        $state
          .go(name, toParams, angular.extend({}, options, {notify: false}))
          .then(function () {
            $rootScope
              .$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams, options);
          });
      }

      /**
       * Checks if event $stateChangeStart hasn't been disabled by default
       *
       * @returns {boolean}
       */
      function isStateChangeStartDefaultPrevented() {
        return $rootScope.$broadcast('$stateChangeStart', toState, toParams, fromState, fromParams, options).defaultPrevented;
      }

      /**
       * Checks if event $stateChangePermissionStart hasn't been disabled by default
       *
       * @returns {boolean}
       */
      function isStateChangePermissionStartDefaultPrevented() {
        return $rootScope.$broadcast('$stateChangePermissionStart', toState, toParams, options).defaultPrevented;
      }
    });
  });
}());
