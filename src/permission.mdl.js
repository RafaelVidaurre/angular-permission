(function () {
  'use strict';

  var permission = angular.module('permission', ['ui.router']);

  permission.run(['$rootScope', 'Permission', '$state', '$q', function ($rootScope, Permission, $state, $q) {
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

      if (areSetStatePermissions()) {
        setStateAuthorizationStatus(true);
        event.preventDefault();

        if (!areStateEventsDefaultPrevented()) {
          var permissions = toState.data.permissions;
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
      function areSetStatePermissions() {
        return !toState.$$isAuthorizationFinished && toState.data && toState.data.permissions;
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
       * Handles state authorization
       *
       * @param permissions {Object} Map of "only" or "except" permission names
       */
      function authorizeForState(permissions) {
        Permission
          .authorize(permissions, toParams)
          .then(function () {
            $rootScope.$broadcast('$stateChangePermissionAccepted', toState, toParams);
            goToState(toState.name);
          })
          .catch(function (rejectedPermission) {
            $rootScope.$broadcast('$stateChangePermissionDenied', toState, toParams);
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
              .$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
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

        if (angular.isString(redirectState)){
          handleStringRedirect(redirectState);
        }
      }

      /**
       * Handles string based redirection for rejected permissions
       *
       * @param state {String} State to which app should be redirected
       */
      function handleStringRedirect(state){
        $state.go(state, toParams);
      }

      /**
       * Checks if event $stateChangeStart hasn't been disabled by default
       *
       * @returns {boolean}
       */
      function isStateChangeStartDefaultPrevented() {
        return $rootScope.$broadcast('$stateChangeStart', toState, toParams, fromState, fromParams).defaultPrevented;
      }

      /**
       * Checks if event $stateChangePermissionStart hasn't been disabled by default
       *
       * @returns {boolean}
       */
      function isStateChangePermissionStartDefaultPrevented() {
        return $rootScope.$broadcast('$stateChangePermissionStart', toState, toParams).defaultPrevented;
      }
    });
  }]);
}());