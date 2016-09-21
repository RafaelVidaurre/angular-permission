'use strict';

/**
 * Access rights map factory
 * @name permission.PermPermissionMap
 *
 * @param $q {Object} Angular promise implementation
 * @param $log {Object} Angular logging utility
 * @param PermTransitionProperties {permission.PermTransitionProperties} Helper storing ui-router transition parameters
 * @param PermRoleStore {permission.PermRoleStore} Role definition storage
 * @param PermPermissionStore {permission.PermPermissionStore} Permission definition storage
 *
 * @return {permission.PermissionMap}
 */
function PermPermissionMap($q, $log, PermTransitionProperties, PermRoleStore, PermPermissionStore) {
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
  function resolveFunctionRedirect(redirectFunction, rejectedPermissionName) {
    return $q
      .when(redirectFunction.call(null, rejectedPermissionName, PermTransitionProperties))
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

  return PermissionMap;
}

angular
  .module('permission')
  .factory('PermPermissionMap', PermPermissionMap);