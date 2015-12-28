(function () {
  'use strict';

  angular
    .module('permission')
    .factory('Role', function ($q, PermissionStore) {

      function Role(roleName, permissionNames, validationFunction) {
        validateConstructor(roleName, permissionNames);
        this.roleName = roleName;
        this.permissionNames = permissionNames;

        if (validationFunction) {
          angular.forEach(permissionNames, function (permissionName) {
            PermissionStore.defineManyPermissions(permissionName, validationFunction);
          });
        }
      }

      /**
       * Checks if permission is still valid
       *
       * @param toParams {Object} UI-Router params object
       * @returns {promise}
       */
      Role.prototype.validateRole = function (toParams) {
        var promises = [];

        angular.forEach(this.permissionNames, function (permissionName) {
          if (PermissionStore.hasPermission(permissionName)) {
            var permission = PermissionStore.getPermission(permissionName);
            var validationResult = permission.validationFunction.call(null, toParams, this.permissionName);

            if (!angular.isFunction(validationResult.then)) {
              validationResult = wrapInPromise(validationResult);
            }

            promises.push(validationResult);
          } else {
            promises.push($q.reject(null));
          }
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
      function validateConstructor(roleName, permissions) {
        if (!angular.isString(roleName)) {
          throw new TypeError('Parameter "permission" name must be String');
        }
        if (!angular.isFunction(permissions)) {
          throw new TypeError('Parameter "permissions" must be Array');
        }
      }

      return Role;
    });
}());