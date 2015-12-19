(function () {
  'use strict';

  var permission = angular.module('permission', ['ui.router']);

  /**
   * This decorator is required to access full state object instead of it's configuration
   * when trying to obtain full toState state object not it's configuration
   * Can be removed when implemented https://github.com/angular-ui/ui-router/issues/13.
   */
  permission.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.decorator('parent', function (state, parentFn) {
      state.self.getState = function () {
        return state;
      };
      return parentFn(state);
    });
  }]);

  permission.run(['$rootScope', 'Permission', '$state', '$q', function ($rootScope, Permission, $state, $q) {
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {

      if (areSetStatePermissions(toState)) {
        setStateAuthorizationStatus(true);
        event.preventDefault();

        if (!areStateEventsDefaultPrevented()) {
          var permissions = compensatePermissionMap(toState.data.permissions);
          authorizeForState(permissions);
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
        var permissionMap = {only: [], except: []};

        var toStatePath = $state
          .get(toState.name)
          .getState()
          .path.reverse();

        angular.forEach(toStatePath, function (state) {
          if (areSetStatePermissions(state.self)) {
            permissionMap = extendStatePermissionsMap(permissionMap, state.self.data.permissions);
          }
        });

        if (angular.isDefined(statePermissionMap.redirectTo)) {
          permissionMap.redirectTo = statePermissionMap.redirectTo;
        }

        return permissionMap;
      }

      /**
       * Extends permission map by pushing to it state's permissions
       *
       * @param permissionMap {Object} Compensated permission map
       * @param statePermissionMap {Object} Current state permission map
       * @returns {Object}
       */
      function extendStatePermissionsMap(permissionMap, statePermissionMap) {
        if (angular.isDefined(statePermissionMap.only)) {
          var onlyPermissionsArray = resolvePermissionMapProperty(statePermissionMap.only);
          permissionMap.only = permissionMap.only.concat(onlyPermissionsArray);
        }

        if (angular.isDefined(statePermissionMap.except)) {
          var exceptPermissionsArray = resolvePermissionMapProperty(statePermissionMap.except);
          permissionMap.except = permissionMap.except.concat(exceptPermissionsArray);
        }

        return permissionMap;
      }

      /**
       * Handles extraction of permission map "only" and "except" properties
       * @private
       *
       * @param property {Array|Function|promise} Permission map property "only" or "except"
       * @returns {Array}
       */
      function resolvePermissionMapProperty(property) {
        if (angular.isString(property)) {
          return [property];
        }

        if (angular.isArray(property)) {
          return property;
        }

        if (angular.isFunction(property)) {
          return property.call(null, toState, toParams, options);
        }

        throw new TypeError('Parameter "permissionMap" properties "only" and "except" must be either String, Array or Function');
      }

      /**
       * Handles state authorization
       *
       * @param permissions {Object} Map of "only" or "except" permission names
       */
      function authorizeForState(permissions) {
        Permission
          .authorize(permissions, toParams)
          .then(function () {
            $rootScope.$broadcast('$stateChangePermissionAccepted', toState, toParams, options);
            goToState(toState.name);
          })
          .catch(function (rejectedPermission) {
            $rootScope.$broadcast('$stateChangePermissionDenied', toState, toParams, options);
            redirectToState(permissions.redirectTo, rejectedPermission);
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
          .go(name, toParams, {notify: false})
          .then(function () {
            $rootScope
              .$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams, options);
          });
      }

      /**
       * Redirects to fallback states when permissions fail
       *
       * @param redirectTo {Object|Function|String} Redirection configuration
       * @param permission {String} Permission name
       */
      function redirectToState(redirectTo, permission) {
        if (angular.isFunction(redirectTo)) {
          handleFunctionRedirect(redirectTo, permission);
        }

        if (angular.isObject(redirectTo)) {
          handleObjectRedirect(redirectTo, permission);
        }

        if (angular.isString(redirectTo)) {
          handleStringRedirect(redirectTo);
        }
      }

      /**
       * Handles function based redirection for rejected permissions
       *
       * @param redirectFunction {Function} Redirection function
       * @param permission {String} Rejected permission
       */
      function handleFunctionRedirect(redirectFunction, permission) {
        $q.when(redirectFunction.call(null, permission))
          .then(function (redirectState) {
            if (!angular.isString(redirectState)) {
              throw new TypeError('When used "redirectTo" as function, returned value must be string with state name');
            }
            handleStringRedirect(redirectState);
          });
      }

      /**
       * Handles object based redirection for rejected permissions
       *
       * @param redirectObject {Object} Redirection function
       * @param permission {String} Rejected permission
       */
      function handleObjectRedirect(redirectObject, permission) {
        if (!angular.isDefined(redirectObject['default'])) {
          throw new ReferenceError('When used "redirectTo" as object, property "default" must be defined');
        }

        var redirectState = redirectObject[permission];

        if (!angular.isDefined(redirectState)) {
          redirectState = redirectObject['default'];
        }

        if (angular.isFunction(redirectState)) {
          handleFunctionRedirect(redirectState, permission);
        }

        if (angular.isString(redirectState)) {
          handleStringRedirect(redirectState);
        }
      }

      /**
       * Handles string based redirection for rejected permissions
       *
       * @param state {String} State to which app should be redirected
       */
      function handleStringRedirect(state) {
        $state.go(state, toParams, options);
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
  }]);
}());
