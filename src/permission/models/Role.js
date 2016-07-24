'use strict';

/**
 * Role definition factory
 * @function
 *
 * @param $q {Object} Angular promise implementation
 * @param permPermissionStore {permission.permPermissionStore} Permission definition storage
 * @param permTransitionProperties {permission.permTransitionProperties} Helper storing ui-router transition parameters
 *
 * @return {Role}
 */
function permRole($q, permPermissionStore, permTransitionProperties) {
  'ngInject';

  /**
   * Role definition constructor
   * @constructor Role
   *
   * @param roleName {String} Name representing role
   * @param validationFunction {Function|Array<String>} Optional function used to validate if permissions are still
   *   valid or list of permission names representing role
   */
  function Role(roleName, validationFunction) {
    validateConstructor(roleName, validationFunction);

    this.roleName = roleName;
    this.validationFunction = validationFunction;
  }

  /**
   * Checks if role is still valid
   * @methodOf permission.Role
   *
   * @returns {Promise} $q.promise object
   */
  Role.prototype.validateRole = function () {
    if (angular.isFunction(this.validationFunction)) {
      var validationResult = this.validationFunction.call(null, this.roleName, permTransitionProperties);
      if (!angular.isFunction(validationResult.then)) {
        validationResult = wrapInPromise(validationResult, this.roleName);
      }

      return validationResult;
    }

    if (angular.isArray(this.validationFunction)) {
      var promises = this.validationFunction.map(function (permissionName) {
        if (permPermissionStore.hasPermissionDefinition(permissionName)) {
          var permission = permPermissionStore.getPermissionDefinition(permissionName);

          return permission.validatePermission();
        }

        return $q.reject(permissionName);
      });

      return $q.all(promises);
    }
  };

  /**
   * Converts a value into a promise, if the value is truthy it resolves it, otherwise it rejects it
   * @methodOf permission.Role
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
   * @methodOf permission.Role
   * @private
   *
   * @throws {TypeError}
   *
   * @param roleName {String} Name representing role
   * @param validationFunction {Function|Array<String>} Optional function used to validate if permissions are still
   *   valid or list of permission names representing role
   */
  function validateConstructor(roleName, validationFunction) {
    if (!angular.isString(roleName)) {
      throw new TypeError('Parameter "roleName" name must be String');
    }

    if (!angular.isArray(validationFunction) && !angular.isFunction(validationFunction)) {
      throw new TypeError('Parameter "validationFunction" must be array or function');
    }
  }

  return Role;
}

angular
  .module('permission')
  .factory('permRole', permRole);