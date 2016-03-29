(function () {
  'use strict';

  /**
   * @namespace permission
   */
  var permission = angular.module('permission', ['ui.router']);

  /**
   * This decorator is required to access full state object instead of it's configuration
   * when trying to obtain full toState state object not it's configuration
   * Can be removed when implemented https://github.com/angular-ui/ui-router/issues/13.
   */
  permission.config(function ($stateProvider) {
    $stateProvider.decorator('parent', function (state, parentFn) {
      state.self.$$state = function () {
        return state;
      };
      return parentFn(state);
    });
  });

  permission.run(function ($rootScope, $state, $q, $location, Authorization, PermissionMap) {
    /**
     * State transition interceptor
     */
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {

      if (!isAuthorizationFinished()) {
        event.preventDefault();
        setStateAuthorizationStatus(true);

        if (!areStateEventsDefaultPrevented()) {
          $rootScope.$broadcast('$stateChangePermissionStart', toState, toParams, options);

          var compensatedPermissionMap = compensatePermissionMap();
          authorizeForState(compensatedPermissionMap);
        }
      }

      /**
       * Checks if state is qualified to be permission based verified
       * @method
       * @private
       *
       * @returns {boolean}
       */
      function areSetStatePermissions(state) {
        return angular.isDefined(state.data) && angular.isDefined(state.data.permissions);
      }

      /**
       * Sets internal state `$$finishedAuthorization` variable to prevent looping
       * @method
       * @private
       *
       * @param status {boolean} When true authorization has been already preceded
       */
      function setStateAuthorizationStatus(status) {
        angular.extend(toState, {'$$isAuthorizationFinished': status});
      }


      /**
       * Checks if state has been already checked for authorization
       * @method
       * @private
       *
       * @returns {boolean}
       */
      function isAuthorizationFinished() {
        return toState.$$isAuthorizationFinished;
      }

      /**
       * Checks if state events are not prevented by default
       * @method
       * @private
       *
       * @returns {boolean}
       */
      function areStateEventsDefaultPrevented() {
        return isStateChangePermissionStartDefaultPrevented() || isStateChangeStartDefaultPrevented();
      }

      /**
       * Builds map of permissions resolving passed values to data.permissions and combine them with all its parents
       * keeping the order of permissions from the newest (children) to the oldest (parent)
       * @method
       * @private
       *
       * @returns {permission.PermissionMap} Permission map
       */
      function compensatePermissionMap() {
        var permissionMap = new PermissionMap();

        var toStatePath = $state
          .get(toState.name)
          .$$state().path
          .slice()
          .reverse();

        toStatePath.forEach(function (state) {
          if (areSetStatePermissions(state)) {
            permissionMap.extendPermissionMap(new PermissionMap(state.data.permissions));
          }
        });

        return permissionMap;
      }

      /**
       * Handles state authorization
       * @method
       * @private
       *
       * @param permissionMap {permission.PermissionMap} Map of permission names
       */
      function authorizeForState(permissionMap) {
        Authorization
          .authorize(permissionMap, toParams)
          .then(function () {
            handleAuthorizedState();
          })
          .catch(function (rejectedPermission) {
            handleUnauthorizedState(permissionMap, rejectedPermission);
          })
          .finally(function () {
            setStateAuthorizationStatus(false);
          });
      }

      /**
       * Handles redirection for authorized access
       * @method
       * @private
       */
      function handleAuthorizedState() {
        $rootScope.$broadcast('$stateChangePermissionAccepted', toState, toParams, options);

        $location.replace();

        $state
          .go(toState.name, toParams, {notify: false})
          .then(function () {
            $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
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
        $rootScope.$broadcast('$stateChangePermissionDenied', toState, toParams, options);

        permissionMap
          .resolveRedirectState(rejectedPermission)
          .then(function (redirect) {
            $state.go(redirect.state, redirect.params, redirect.options);
          });
      }

      /**
       * Checks if event $stateChangeStart hasn't been disabled by default
       * @method
       * @private
       *
       * @returns {boolean}
       */
      function isStateChangeStartDefaultPrevented() {
        return $rootScope.$broadcast('$stateChangeStart', toState, toParams, fromState, fromParams, options).defaultPrevented;
      }

      /**
       * Checks if event $stateChangePermissionStart hasn't been disabled by default
       * @method
       * @private
       *
       * @returns {boolean}
       */
      function isStateChangePermissionStartDefaultPrevented() {
        return $rootScope.$broadcast('$stateChangePermissionStart', toState, toParams, options).defaultPrevented;
      }
    });
  });
}());
