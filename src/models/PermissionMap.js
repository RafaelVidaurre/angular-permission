(function () {
  'use strict';

  /**
   * Access rights map factory
   * @name PermissionMapFactory
   *
   * @param $q {Object} Angular promise implementation
   * @param TransitionProperties {permission.TransitionProperties} Helper storing ui-router transition parameters
   * @param RoleStore {permission.RoleStore} Role definition storage
   * @param PermissionStore {permission.PermissionStore} Permission definition storage
   *
   * @return {permission.PermissionMap}
   */
  function PermissionMapFactory($q, TransitionProperties, RoleStore, PermissionStore) {
    /**
     * Constructs map object instructing authorization service how to handle authorizing
     * @constructor PermissionMap
     * @memberOf permission
     *
     * @param [permissionMap] {Object} Map of permissions provided to authorization service
     * @param [permissionMap.only] {Array} List of exclusive access right names allowed for authorization
     * @param [permissionMap.except] {Array} List of exclusive access right names denied for authorization
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
     * @method
     * @methodOf permission.PermissionMap
     *
     * @param rejectedPermissionName {String} Permission name
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
      return $q.reject(null);
    };

    /**
     * Resolves weather permissions set for "only" or "except" property are valid
     * @method
     *
     * @param property {permissionMap.only|permissionMap.except} "only" or "except" map property
     * @returns {Array<Promise>}
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
     * @method
     * @methodOf permission.PermissionMap
     * @throws {TypeError}
     *
     * @param redirectFunction {Function} Redirection function
     * @param permission {String} Rejected permission
     *
     * @return {Promise}
     */
    function resolveFunctionRedirect(redirectFunction, permission) {
      return $q
        .when(redirectFunction.call(null, permission))
        .then(function (redirectState) {
          if (angular.isString(redirectState)) {
            return {
              state: redirectState
            };
          }

          if (angular.isObject(redirectState)) {
            return redirectState;
          }

          throw new TypeError('When used "redirectTo" as function, returned value must be string or object');
        });
    }

    /**
     * Handles object based redirection for rejected permissions
     * @method
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
     * @method
     * @private
     *
     * @param property {String|Array|Function|Promise} Permission map property "only" or "except"
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
}());