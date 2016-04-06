(function () {
  'use strict';

  /**
   * Access rights map factory
   * @function
   * @lends {permission.PermissionMap}
   *
   * @param $q {$q} Angular promise implementation
   * @param TransitionProperties {permission.TransitionProperties} Helper storing ui-router transition parameters
   *
   * @return {permission.PermissionMap}
   */
  function PermissionMapFactory($q, TransitionProperties) {
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

      this.only = resolvePermissionMapProperty(permissionMap.only);
      this.except = resolvePermissionMapProperty(permissionMap.except);
      this.redirectTo = permissionMap.redirectTo;
    }

    /**
     * Extends permission map by pushing to it state's permissions
     * @method
     * @methodOf permission.PermissionMap
     *
     * @param permissionMap {permission.PermissionMap} Compensated permission map
     */
    PermissionMap.prototype.extendPermissionMap = function (permissionMap) {
      if (permissionMap.only.length) {
        this.only = this.only.concat([permissionMap.only]);
      }
      if (permissionMap.except.length) {
        this.except = this.except.concat([permissionMap.except]);
      }
      this.redirectTo = permissionMap.redirectTo;
    };

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
     * Checks if provided map is compensated or not
     * @method
     * @methodOf permission.PermissionMap
     *
     * @returns {boolean}
     */
    PermissionMap.prototype.isStatePermissionMap = function () {
      return !!((angular.isArray(this.only[0])) || angular.isArray(this.except[0]));
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
     * Handles extraction of permission map "only" and "except" properties
     * @method
     * @private
     *
     * @param property {Array|Function|promise} Permission map property "only" or "except"
     *
     * @returns {Array} Array of permission "only" or "except" names
     */
    function resolvePermissionMapProperty(property) {
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