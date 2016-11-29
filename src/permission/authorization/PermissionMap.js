'use strict';

/**
 * Access rights map factory
 * @name permission.PermPermissionMap
 *
 * @param $q {Object} Angular promise implementation
 * @param $log {Object} Angular logging utility
 * @param $injector {Object} Dependency injection instance
 * @param PermTransitionProperties {permission.PermTransitionProperties} Helper storing ui-router transition parameters
 * @param PermRoleStore {permission.PermRoleStore} Role definition storage
 * @param PermPermissionStore {permission.PermPermissionStore} Permission definition storage
 *
 * @return {permission.PermissionMap}
 */
function PermPermissionMap($q, $log, $injector, PermTransitionProperties, PermRoleStore, PermPermissionStore) {
  'ngInject';

  /**
   * Constructs map object instructing authorization service how to handle authorizing
   * @constructor permission.PermissionMap
   *
   * @param [permissionMap] {Object} Map of permissions provided to authorization service
   * @param [permissionMap.only] {String|Array|Function} List of exclusive access right names allowed for
   *   authorization
   * @param [permissionMap.except] {String|Array|Function} List of exclusive access right names denied for
   *   authorization
   * @param [permissionMap.redirectTo] {String|Function|Object|promise} Handling redirection when rejected
   *   authorization
   */
  function PermissionMap(permissionMap) {
    // Suppress not defined object errors
    permissionMap = permissionMap || {};

    this.only = normalizeMapProperty(permissionMap.only);
    this.except = normalizeMapProperty(permissionMap.except);
    this.redirectTo = normalizeRedirectToProperty(permissionMap.redirectTo);
  }

  /**
   * Redirects to fallback states when permissions fail
   * @methodOf permission.PermissionMap
   *
   * @param [rejectedPermissionName] {String} Permission name
   *
   * @return {Promise}
   */
  PermissionMap.prototype.resolveRedirectState = function (rejectedPermissionName) {

    var redirectState = this.redirectTo[rejectedPermissionName] || this.redirectTo['default'];

    // If redirectTo definition is not found stay where you are
    if (!angular.isDefined(redirectState)) {
      return $q.reject();
    }

    return resolveRedirectState(redirectState, rejectedPermissionName);
  };

  /**
   * Resolves weather permissions set for "only" or "except" property are valid
   * @methodOf permission.PermissionMap
   *
   * @param property {Array} "only" or "except" map property
   *
   * @return {Array<Promise>}
   */
  PermissionMap.prototype.resolvePropertyValidity = function (property) {

    return property.map(function (privilegeName) {
      if (PermRoleStore.hasRoleDefinition(privilegeName)) {
        var role = PermRoleStore.getRoleDefinition(privilegeName);
        return role.validateRole();
      }

      if (PermPermissionStore.hasPermissionDefinition(privilegeName)) {
        var permission = PermPermissionStore.getPermissionDefinition(privilegeName);
        return permission.validatePermission();
      }

      $log.warn('Permission or role ' + privilegeName + ' was not defined.');
      return $q.reject(privilegeName);
    });
  };

  /**
   * Handles function based redirection for rejected permissions
   * @methodOf permission.PermissionMap
   *
   * @throws {TypeError}
   *
   * @param redirectFunction {Function} Redirection function
   * @param rejectedPermissionName {String} Rejected permission
   *
   * @return {Promise}
   */
  function resolveRedirectState(redirectFunction, rejectedPermissionName) {
    return $q
      .when($injector.invoke(redirectFunction, null, {
        rejectedPermission: rejectedPermissionName,
        transitionProperties: PermTransitionProperties
      }))
      .then(function (redirectState) {
        if (angular.isString(redirectState)) {
          return {
            state: redirectState
          };
        }

        if (angular.isObject(redirectState)) {
          return redirectState;
        }

        return $q.reject();
      });
  }

  /**
   * Handles extraction of permission map "only" and "except" properties and converts them into array objects
   * @methodOf permission.PermissionMap
   * @private
   *
   * @param property {String|Array|Function} PermPermission map property "only" or "except"
   *
   * @returns {Array<String>} Array of permission "only" or "except" names
   */
  function normalizeMapProperty(property) {
    if (angular.isString(property)) {
      return [property];
    }

    if (angular.isArray(property)) {
      return property;
    }

    if (angular.isFunction(property)) {
      return property.call(null, PermTransitionProperties);
    }

    return [];
  }

  /**
   * Convert user provided input into key value dictionary with permission/role name as a key and injectable resolver
   * function as a value
   * @methodOf permission.PermissionMap
   * @private
   *
   * @param redirectToProperty {String|Function|Array|Object} PermPermission map property "redirectTo"
   *
   * @returns {Object<String, Object>} Redirection dictionary object
   */
  function normalizeRedirectToProperty(redirectToProperty) {
    if (angular.isString(redirectToProperty)) {
      return {
        default: ['rejectedPermission', 'transitionProperties', function () {
          return {state: redirectToProperty}
        }]
      };
    }

    if (angular.isObject(redirectToProperty)) {
      if (!angular.isDefined(redirectToProperty['default'])) {
        throw new ReferenceError('When used "redirectTo" as object, property "default" must be defined');
      }

      var redirectionMap = {};

      angular.forEach(redirectToProperty, function (redirection, permission) {
        if (angular.isArray(redirection) || angular.isArray(redirection.$inject)) {
          redirectionMap[permission] = redirection;
        }

        if (angular.isFunction(redirection)) {
          redirectionMap[permission] = redirection;
          redirectionMap[permission].$inject = ['rejectedPermission', 'transitionProperties'];
        }

        if (angular.isObject(redirection)) {
          redirectionMap[permission] = function () {
            return redirection;
          };
          redirectionMap[permission].$inject = ['rejectedPermission', 'transitionProperties'];
        }

        if (angular.isString(redirection)) {
          redirectionMap[permission] = function () {
            return {state: redirection};
          };
          redirectionMap[permission].$inject = ['rejectedPermission', 'transitionProperties'];
        }
      });

      return redirectionMap;
    }

    if (angular.isFunction(redirectToProperty)) {
      return {default: ['rejectedPermission', 'transitionProperties', redirectToProperty]};
    }

    return redirectToProperty;
  }

  return PermissionMap;
}

angular
  .module('permission')
  .factory('PermPermissionMap', PermPermissionMap);