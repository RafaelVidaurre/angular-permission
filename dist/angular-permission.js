/**
 * angular-permission
 * Route permission and access control as simple as it can get
 * @version v1.2.0 - 2015-12-28
 * @link http://www.rafaelvidaurre.com
 * @author Rafael Vidaurre <narzerus@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

(function () {
  'use strict';

  angular
    .module('permission')
    .service('Authorization', ['$q', 'PermissionStore', function ($q, PermissionStore) {
      this.authorize = authorize;

      /**
       * Checks if provided permissions are acceptable
       *
       * @param permissionsMap {Object} Map of "only" and "except" permission names
       * @param toParams {Object} UI-Router params object
       * @returns {promise} $q.promise object
       */
      function authorize(permissionsMap, toParams) {
        validatePermissionMap(permissionsMap);
        return handleAuthorization(permissionsMap, toParams);
      }

      /**
       * Checks if provided permission map has accepted parameter types
       * @private
       *
       * @param permissionMap {Object}
       */
      function validatePermissionMap(permissionMap) {
        if (!angular.isObject(permissionMap)) {
          throw new TypeError('Parameter "permissionMap" has to be Object');
        }

        if (angular.isUndefined(permissionMap.only) && angular.isUndefined(permissionMap.except)) {
          throw new ReferenceError('Either "only" or "except" keys must me defined');
        }

        if (!(angular.isArray(permissionMap.only) || angular.isArray(permissionMap.except))) {
          throw new TypeError('Parameter "permissionMap" properties must be Array');
        }
      }

      /**
       * Handles authorization based on provided permissions map
       * @private
       *
       * @param permissionsMap {Object} Map of "only" and "except" permission names
       * @param toParams {Object} UI-Router params object
       * @returns {promise} $q.promise object
       */
      function handleAuthorization(permissionsMap, toParams) {
        var deferred = $q.defer();

        var exceptPromises = findMatchingPermissions(permissionsMap.except, toParams);

        $q.all(exceptPromises)
          .then(function (rejectedPermissions) {
            // If any "except" permissions are found reject authorization
            if (rejectedPermissions.length) {
              deferred.reject(rejectedPermissions);
            } else {
              // If none go to checking "only" permissions
              return $q.reject(null);
            }
          })
          .catch(function () {
            var onlyPromises = findMatchingPermissions(permissionsMap.only, toParams);
            $q.all(onlyPromises)
              .then(function (resolvedPermissions) {
                deferred.resolve(resolvedPermissions);
              })
              .catch(function (rejectedPermission) {
                deferred.reject(rejectedPermission);
              });
          });

        return deferred.promise;
      }

      /**
       * Performs iteration over list of defined permissions looking for matching roles
       * @private
       *
       * @param permissionNames {Array} Set of permission names
       * @param toParams {Object} UI-Router params object
       * @returns {Array} Promise collection
       */
      function findMatchingPermissions(permissionNames, toParams) {
        var promises = [];

        angular.forEach(permissionNames, function (permissionName) {
          var dfd = $q.defer();

          if (PermissionStore.hasPermission(permissionName)) {
            var permission = PermissionStore.getPermission(permissionName);
            var validationResult = permission.validatePermission(toParams);

            validationResult
              .then(function () {
                dfd.resolve(permissionName);
              })
              .catch(function () {
                dfd.reject(permissionName);
              });
          } else {
            dfd.reject(permissionName);
          }

          promises.push(dfd.promise);
        });

        return promises;
      }
    }]);
})();

(function () {
  'use strict';

  /**
   * Show/hide elements based on provided permissions
   *
   * @example
   * <div permission only="'USER'"></div>
   * <div permission only="['USER','ADMIN']" except="'MANAGER'"></div>
   * <div permission except="'MANAGER'"></div>
   */
  angular
    .module('permission')
    .directive('permission', ['$log', 'Authorization', function ($log, Authorization) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          try {
            Authorization
              .authorize({
                only: scope.$eval(attrs.only),
                except: scope.$eval(attrs.except)
              }, null)
              .then(function () {
                element.removeClass('ng-hide');
              })
              .catch(function () {
                element.addClass('ng-hide');
              });
          } catch (e) {
            element.addClass('ng-hide');
            $log.error(e.message);
          }
        }
      };
    }]);
}());

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

  permission.run(['$rootScope', '$state', '$q', 'Authorization', function ($rootScope, $state, $q, Authorization) {
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
        Authorization
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
          .go(name, toParams, angular.extend({}, options, {notify: false}))
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

(function () {
  'use strict';

  angular
    .module('permission')
    .factory('Permission', ['$q', function ($q) {

      function Permission(permissionName, validationFunction) {
        validatePermissionConstructor(permissionName, validationFunction);

        this.permissionName = permissionName;
        this.validationFunction = validationFunction;
      }

      /**
       * Checks if permission is still valid
       *
       * @param toParams {Object} UI-Router params object
       * @returns {promise}
       */
      Permission.prototype.validatePermission = function (toParams) {
        var validationResult = this.validationFunction.call(null, toParams, this.permissionName);

        if (!angular.isFunction(validationResult.then)) {
          validationResult = wrapInPromise(validationResult);
        }

        return validationResult;
      };

      /**
       * Converts a value into a promise, if the value is truthy it resolves it, otherwise it rejects it
       * @private
       *
       * @param func {Function} Function to be wrapped into promise
       * @return {promise} $q.promise object
       */
      function wrapInPromise(func) {
        var dfd = $q.defer();

        if (func) {
          dfd.resolve();
        } else {
          dfd.reject();
        }

        return dfd.promise;
      }

      /**
       * Checks if provided permission has accepted parameter types
       * @private
       */
      function validatePermissionConstructor(permissionName, validationFunction) {
        if (!angular.isString(permissionName)) {
          throw new TypeError('Parameter "permission" name must be String');
        }
        if (!angular.isFunction(validationFunction)) {
          throw new TypeError('Parameter "validationFunction" must be Function');
        }
      }

      return Permission;
    }]);
}());
(function () {
  'use strict';

  angular
    .module('permission')
    .service('PermissionStore', ['Permission', function (Permission) {
      var permissionStore = {};

      this.defineRole = defineRole;
      this.defineManyRoles = defineManyRoles;
      this.setPermission = setPermission;
      this.setManyPermissions = setManyPermissions;
      this.removePermission = removePermission;
      this.removeManyPermissions = removeManyPermissions;
      this.hasPermission = hasPermission;
      this.getPermission = getPermission;
      this.getPermissions = getPermissions;
      this.clearPermissions = clearPermissions;

      /**
       * Allows to define permission on application configuration
       * @deprecated
       *
       * @param permissionName {String} Name of defined permission
       * @param validationFunction {Function} Function used to validate if permission is valid
       */
      function defineRole(permissionName, validationFunction) {
        console.warn('Function "defineRole" will be deprecated. Use "setPermission" instead');
        setPermission(permissionName, validationFunction);
      }

      /**
       * Allows to define set of permissions with shared validation function in runtime
       * @deprecated
       *
       * @param permissionNames {Array} Set of permission names
       * @param validationFunction {Function} Function used to validate if permission is valid
       */
      function defineManyRoles(permissionNames, validationFunction) {
        console.warn('Function "defineManyRoles" will be deprecated. Use "setManyPermissions" instead');
        setManyPermissions(permissionNames, validationFunction);
      }

      /**
       * Allows to define permission on application configuration
       *
       * @param permissionName {String} Name of defined permission
       * @param validationFunction {Function} Function used to validate if permission is valid
       */
      function setPermission(permissionName, validationFunction) {
        permissionStore[permissionName] = new Permission(permissionName, validationFunction);
      }

      /**
       * Allows to define set of permissionNames with shared validation function on application configuration
       *
       * @param permissionNames {Array} Set of permission names
       * @param validationFunction {Function} Function used to validate if permission is valid
       */
      function setManyPermissions(permissionNames, validationFunction) {
        if (!angular.isArray(permissionNames)) {
          throw new TypeError('Parameter "permissionNames" name must be Array');
        }

        angular.forEach(permissionNames, function (permissionName) {
          setPermission(permissionName, validationFunction);
        });
      }

      /**
       * Deletes permission
       *
       * @param permissionName {String} Name of defined permission
       */
      function removePermission(permissionName) {
        delete permissionStore[permissionName];
      }

      /**
       * Deletes set of permissions
       *
       * @param permissionNames {Array} Set of permission names
       */
      function removeManyPermissions(permissionNames) {
        angular.forEach(permissionNames, function (permission) {
          delete permissionStore[permission];
        });
      }

      /**
       * Checks if permission exists
       *
       * @param permissionName {String} Name of defined permission
       * @returns {Boolean}
       */
      function hasPermission(permissionName) {
        return angular.isDefined(permissionStore[permissionName]);
      }

      /**
       * Returns permission by it's name
       *
       * @returns {Object} Permissions collection
       */
      function getPermission(permissionName) {
        return permissionStore[permissionName];
      }

      /**
       * Returns all permissions
       *
       * @returns {Object} Permissions collection
       */
      function getPermissions() {
        return permissionStore;
      }

      /**
       * Removes all permissions
       */
      function clearPermissions() {
        permissionStore = [];
      }
    }]);
}());