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

      if (!isAuthorizationFinished() && areSetStatePermissions(toState)) {
        event.preventDefault();
        setStateAuthorizationStatus(true);

        if (!areStateEventsDefaultPrevented()) {
          var compensatedPermissionMap = compensatePermissionMap(toState.data.permissions);
          authorizeForState(compensatedPermissionMap);
        }
      }

      /**
       * Checks if state is qualified to be permission based verified
       *
       * @returns {boolean}
       */
      function areSetStatePermissions(state) {
        return angular.isDefined(state.data) && angular.isDefined(state.data.permissions);
      }

      /**
       * Sets internal state `$$finishedAuthorization` variable to prevent looping
       *
       * @param status {boolean} When true authorization has been already preceded
       */
      function setStateAuthorizationStatus(status) {
        angular.extend(toState, {'$$isAuthorizationFinished': status});
      }


      /**
       * Checks if state has been already checked for authorization
       *
       * @returns {boolean}
       */
      function isAuthorizationFinished() {
        return toState.$$isAuthorizationFinished;
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
       * @returns {PermissionMap} Permission map
       */
      function compensatePermissionMap(statePermissionMap) {
        var permissionMap = new PermissionMap({redirectTo: statePermissionMap.redirectTo});

        var toStatePath = $state
          .get(toState.name)
          .getState().path
          .slice()
          .reverse();

        angular.forEach(toStatePath, function (state) {
          if (areSetStatePermissions(state)) {
            permissionMap.extendPermissionMap(new PermissionMap(state.data.permissions));
          }
        });

        return permissionMap;
      }

      /**
       * Handles state authorization
       *
       * @param permissions {PermissionMap} Map of permission names
       */
      function authorizeForState(permissions) {
        Authorization
          .authorize(permissions, toParams)
          .then(function () {
            $rootScope.$broadcast('$stateChangePermissionAccepted', toState, toParams, options);

            $state
              .go(toState.name, toParams, {notify: false})
              .then(function () {
                $rootScope.$broadcast('$stateChangeSuccess', toState, toParams);
              });
          })
          .catch(function (rejectedPermission) {
            $rootScope.$broadcast('$stateChangePermissionDenied', toState, toParams, options);

            return permissions
              .resolveRedirectState(rejectedPermission)
              .then(function (redirectStateName) {
                $state.go(redirectStateName, toParams);
              });
          })
          .finally(function () {
            setStateAuthorizationStatus(false);
            $rootScope.$broadcast('$stateChangeSuccess');
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
