'use strict';

/**
 * Role definition factory
 * @function
 *
 * @param $q {Object} Angular promise implementation
 * @param $injector {Object} Dependency injection instance
 * @param PermPermissionStore {permission.PermPermissionStore} Permission definition storage
 * @param PermTransitionProperties {permission.PermTransitionProperties} Helper storing ui-router transition parameters
 *
 * @return {Role}
 */
function PermRole($q, $injector, PermPermissionStore, PermTransitionProperties) {
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
    this.validationFunction = annotateValidationFunction(validationFunction);
  }

  /**
   * Checks if role is still valid
   * @methodOf permission.Role
   *
   * @returns {Promise} $q.promise object
   */
  Role.prototype.validateRole = function () {
    var validationLocals = {
      roleName: this.roleName,
      transitionProperties: PermTransitionProperties
    };
    var validationResult = $injector.invoke(this.validationFunction, null, validationLocals);

    if (!angular.isFunction(validationResult.then)) {
      validationResult = wrapInPromise(validationResult, this.roleName);
    }

    return validationResult;
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
    if (result) {
      return $q.resolve(roleName);
    }

    return $q.reject(roleName);
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


  /**
   * Ensures the validation is injectable using explicit annotation.
   * Wraps a non-injectable function for backwards compatibility
   * @methodOf permission.Role
   * @private
   *
   * @param validationFunction {Function|Array} Function to wrap with injectable if needed
   *
   * @return {Function} Explicitly injectable function
   */
  function annotateValidationFunction(validationFunction) {
    // Test if the validation function is just an array of permission names
    if (angular.isArray(validationFunction) && !angular.isFunction(validationFunction[validationFunction.length - 1])) {
      validationFunction = preparePermissionEvaluation(validationFunction);
    } else if (!angular.isArray(validationFunction.$inject || validationFunction)) {
      // The function is not explicitly annotated, so assume using old-style parameters
      // and manually prepare for injection using our known old API parameters
      validationFunction = ['roleName', 'transitionProperties', validationFunction];
    }

    return validationFunction;
  }

  /**
   * Creates an injectable function that evaluates a set of permissions in place of a role validation function
   * @methodOf permission.Role
   * @private
   *
   * @param permissions {Array<String>} List of permissions to evaluate
   *
   * @return {Function}
   */
  function preparePermissionEvaluation(permissions) {
    return function () {
      var promises = permissions.map(function (permissionName) {
        if (PermPermissionStore.hasPermissionDefinition(permissionName)) {
          var permission = PermPermissionStore.getPermissionDefinition(permissionName);

          return permission.validatePermission();
        }

        return $q.reject(permissionName);
      });

      return $q.all(promises);
    };
  }

  return Role;
}

angular
  .module('permission')
  .factory('PermRole', PermRole);