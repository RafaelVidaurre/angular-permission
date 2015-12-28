(function () {
  'use strict';

  angular
    .module('permission')
    .factory('Permission', function ($q) {

      function Permission(permissionName, validationFunction) {
        validateConstructor(permissionName, validationFunction);

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
      function validateConstructor(permissionName, validationFunction) {
        if (!angular.isString(permissionName)) {
          throw new TypeError('Parameter "permissionName" name must be String');
        }
        if (!angular.isFunction(validationFunction)) {
          throw new TypeError('Parameter "validationFunction" must be Function');
        }
      }

      return Permission;
    });
}());