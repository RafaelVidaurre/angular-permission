(function () {
  'use strict';

  /**
   * Role definition factory
   * @name RoleFactory
   *
   * @param $q {Object} Angular promise implementation
   * @param PermissionStore {permission.PermissionStore} Permission definition storage
   * @param TransitionProperties {permission.TransitionProperties} Helper storing ui-router transition parameters
   *
   * @return {permission.Role}
   */
  function RoleFactory($q, PermissionStore, TransitionProperties) {
    /**
     * Role definition constructor
     * @class Role
     * @memberOf permission
     *
     * @param roleName {String} Name representing role
     * @param permissionNames {Array} List of permission names representing role
     * @param [validationFunction] {Function} Optional function used to validate if permissions are still valid
     */
    function Role(roleName, permissionNames, validationFunction) {
      validateConstructor(roleName, permissionNames, validationFunction);
      this.roleName = roleName;
      this.permissionNames = permissionNames || [];
      this.validationFunction = validationFunction;

      if (validationFunction) {
        PermissionStore.defineManyPermissions(permissionNames, validationFunction);
      }
    }

    /**
     * Checks if role is still valid
     * @method
     * @methodOf permission.Role
     *
     * @returns {Promise} $q.promise object
     */
    Role.prototype.validateRole = function () {
      // When permission set is provided check each of them
      if (this.permissionNames.length) {
        var promises = this.permissionNames.map(function (permissionName) {
          if (PermissionStore.hasPermissionDefinition(permissionName)) {
            var permission = PermissionStore.getPermissionDefinition(permissionName);
            var validationResult = permission.validatePermission();

            if (!angular.isFunction(validationResult.then)) {
              validationResult = wrapInPromise(validationResult);
            }

            return validationResult;
          }

          return $q.reject();
        });

        return $q.all(promises);
      }

      // If not call validation function manually
      var validationResult = this.validationFunction.call(null, this.roleName, TransitionProperties);
      if (!angular.isFunction(validationResult.then)) {
        validationResult = wrapInPromise(validationResult, this.roleName);
      }

      return $q.resolve(validationResult);
    };

    /**
     * Converts a value into a promise, if the value is truthy it resolves it, otherwise it rejects it
     * @method
     * @private
     *
     * @param result {Boolean} Function to be wrapped into promise
     * @param [roleName] {String} Returned value in promise
     *
     * @return {Promise}
     */
    function wrapInPromise(result, roleName) {
      var dfd = $q.defer();

      if (result) {
        dfd.resolve(roleName);
      } else {
        dfd.reject(roleName);
      }

      return dfd.promise;
    }

    /**
     * Checks if provided permission has accepted parameter types
     * @method
     * @private
     * @throws {TypeError}
     */
    function validateConstructor(roleName, permissionNames, validationFunction) {
      if (!angular.isString(roleName)) {
        throw new TypeError('Parameter "roleName" name must be String');
      }

      if (!angular.isArray(permissionNames)) {
        throw new TypeError('Parameter "permissionNames" must be Array');
      }

      if (!permissionNames.length && !angular.isFunction(validationFunction)) {
        throw new TypeError('Parameter "validationFunction" must be provided for empty "permissionNames" array');
      }
    }

    return Role;
  }

  angular
    .module('permission')
    .factory('Role', RoleFactory);

}());