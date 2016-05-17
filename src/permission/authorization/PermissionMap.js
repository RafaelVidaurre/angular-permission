'use strict';

/**
 * Access rights map factory
 * @name permission.PermissionMapFactory
 *
 * @param $q {Object} Angular promise implementation
 * @param TransitionProperties {permission.TransitionProperties} Helper storing ui-router transition parameters
 * @param RoleStore {permission.RoleStore} Role definition storage
 * @param PermissionStore {permission.PermissionStore} Permission definition storage
 *
 * @return {permission.PermissionMap}
 */
function PermissionMapFactory($q, TransitionProperties, RoleStore, PermissionStore) {
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
    this.redirectTo = permissionMap.redirectTo;
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
    if (angular.isFunction(this.redirectTo)) {
      return resolveFunctionRedirect(this.redirectTo, rejectedPermissionName);
    }

    if (angular.isObject(this.redirectTo)) {
      return resolveObjectRedirect(this.redirectTo, rejectedPermissionName);
    }

    if (angular.isString(this.redirectTo)) {
      return $q.resolve({
        state: this.redirectTo
      });
    }

    // If redirectTo state is not defined stay where you are
    return $q.reject();
  };

  /**
   * Resolves weather permissions set for "only" or "except" property are valid
   * @methodOf permission.PermissionMap
   *
   * @param property {String|Array|Function} "only" or "except" map property
   *
   * @return {Array<Promise>}
   */
  PermissionMap.prototype.resolvePropertyValidity = function (property) {

    return property.map(function (privilegeName) {
      if (RoleStore.hasRoleDefinition(privilegeName)) {
        var role = RoleStore.getRoleDefinition(privilegeName);
        return role.validateRole();
      }

      if (PermissionStore.hasPermissionDefinition(privilegeName)) {
        var permission = PermissionStore.getPermissionDefinition(privilegeName);
        return permission.validatePermission();
      }

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
  function resolveFunctionRedirect(redirectFunction, rejectedPermissionName) {
    return $q
      .when(redirectFunction.call(null, rejectedPermissionName, TransitionProperties))
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
   * Handles object based redirection for rejected permissions
   * @methodOf permission.PermissionMap
   *
   * @throws {ReferenceError}
   *
   * @param redirectObject {Object} Redirection function
   * @param permission {String} Rejected permission
   *
   * @return {Promise}
   */
  function resolveObjectRedirect(redirectObject, permission) {
    if (!angular.isDefined(redirectObject['default'])) {
      throw new ReferenceError('When used "redirectTo" as object, property "default" must be defined');
    }

    var redirectState = redirectObject[permission];

    if (!angular.isDefined(redirectState)) {
      redirectState = redirectObject['default'];
    }

    if (angular.isFunction(redirectState)) {
      return resolveFunctionRedirect(redirectState, permission);
    }

    if (angular.isObject(redirectState)) {
      return $q.resolve(redirectState);
    }

    if (angular.isString(redirectState)) {
      return $q.resolve({
        state: redirectState
      });
    }
  }

  /**
   * Handles extraction of permission map "only" and "except" properties and converts them into array objects
   * @methodOf permission.PermissionMap
   * @private
   *
   * @param property {String|Array|Function} Permission map property "only" or "except"
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
      return property.call(null, TransitionProperties);
    }

    return [];
  }

  return PermissionMap;
}

angular
  .module('permission')
  .factory('PermissionMap', PermissionMapFactory);