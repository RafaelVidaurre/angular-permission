(function () {
  'use strict';

  angular
    .module('permission')
    .factory('Role', function ($q, PermissionStore) {

      /**
       * Role definition constructor
       *
       * @param roleName {String} Name representing role
       * @param permissionNames {Array} List of permission names representing role
       * @param [validationFunction] {Function} Optional function used to validate if permissions are still valid
       * @constructor
       */
      function Role(roleName, permissionNames, validationFunction) {
        validateConstructor(roleName, permissionNames);
        this.roleName = roleName;
        this.permissionNames = permissionNames || [];

        if (validationFunction) {
          PermissionStore.defineManyPermissions(permissionNames, validationFunction);
        }
      }

      /**
       * Checks if role is still valid
       *
       * @param toParams {Object} UI-Router params object
       * @returns {promise} $q.promise object
       */
      Role.prototype.validateRole = function (toParams) {

        var promises = this.permissionNames.map(function (permissionName) {
          if (PermissionStore.hasPermissionDefinition(permissionName)) {
            var permission = PermissionStore.getPermissionDefinition(permissionName);
            var validationResult = permission.validationFunction.call(null, toParams, permission.permissionName);

            if (!angular.isFunction(validationResult.then)) {
              validationResult = wrapInPromise(validationResult);
            }

            return validationResult;
          }

          return $q.reject(null);
        });

        return $q.all(promises);
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
      function validateConstructor(roleName, permissionNames) {
        if (!angular.isString(roleName)) {
          throw new TypeError('Parameter "roleName" name must be String');
        }
        if (!angular.isArray(permissionNames)) {
          throw new TypeError('Parameter "permissionNames" must be Array');
        }
      }

      return Role;
    });
}());