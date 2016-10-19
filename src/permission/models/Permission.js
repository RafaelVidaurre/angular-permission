'use strict';

/**
 * PermPermission definition factory
 * @function
 *
 * @param $q {Object} Angular promise implementation
 * @param PermTransitionProperties {permission.PermTransitionProperties} Helper storing ui-router transition parameters
 *
 * @return {Permission}
 */
function PermPermission($q, $injector, PermTransitionProperties) {
  'ngInject';

  /**
   * PermPermission definition object constructor
   * @constructor Permission
   *
   * @param permissionName {String} Name repressing permission
   * @param validationFunction {Function} Function used to check if permission is valid
   */
  function Permission(permissionName, validationFunction) {
    validateConstructor(permissionName, validationFunction);

    this.permissionName = permissionName;
    this.validationFunction = annotateValidationFunction(validationFunction);
  }

  /**
   * Checks if permission is still valid
   * @methodOf permission.Permission
   *
   * @returns {Promise}
   */
  Permission.prototype.validatePermission = function () {
    var validationLocals = {
      permissionName: this.permissionName,
      transitionProperties: PermTransitionProperties
    };
    var validationResult = $injector.invoke(this.validationFunction, null, validationLocals);

    if (!angular.isFunction(validationResult.then)) {
      validationResult = wrapInPromise(validationResult, this.permissionName);
    }

    return validationResult;
  };

  /**
   * Converts a value into a promise, if the value is truthy it resolves it, otherwise it rejects it
   * @methodOf permission.Permission
   * @private
   *
   * @param result {Boolean} Function to be wrapped into promise
   * @param permissionName {String} Returned value in promise
   *
   * @return {Promise}
   */
  function wrapInPromise(result, permissionName) {
    if (result) {
      return $q.resolve(permissionName);
    }

    return $q.reject(permissionName);
  }

  /**
   * Checks if provided permission has accepted parameter types
   * @methodOf permission.Permission
   * @private
   *
   * @throws {TypeError}
   *
   * @param permissionName {String} Name repressing permission
   * @param validationFunction {Function} Function used to check if permission is valid
   */
  function validateConstructor(permissionName, validationFunction) {
    if (!angular.isString(permissionName)) {
      throw new TypeError('Parameter "permissionName" name must be String');
    }
    if (!angular.isFunction(validationFunction) && !angular.isArray(validationFunction)) {
      throw new TypeError('Parameter "validationFunction" must be Function or an injectable Function using explicit annotation');
    }
  }

  /**
   * Ensures the validation is injectable using explicit annotation.
   * Wraps a non-injectable function for backwards compatibility
   * @methodOf permission.Permission
   * @private
   *
   * @param validationFunction {Function} Function to wrap with injectable if needed
   *
   * @return {Function} Explicitly injectable function
   */
  function annotateValidationFunction(validationFunction) {
    if (!angular.isArray(validationFunction.$inject || validationFunction)) {
      // The function is not explicitly annotated, so assume using old-style parameters
      // and manually prepare for injection using our known old API parameters
      validationFunction = ['permissionName', 'transitionProperties', validationFunction];
    }

    return validationFunction;
  }

  return Permission;
}

angular
  .module('permission')
  .factory('PermPermission', PermPermission);