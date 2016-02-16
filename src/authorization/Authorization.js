(function () {
  'use strict';

  angular
    .module('permission')
    .service('Authorization', function ($q, PermissionMap, PermissionStore, RoleStore) {
      this.authorize = authorize;

      /**
       * Checks if provided permissions are acceptable
       *
       * @param permissionsMap {PermissionMap} Map of permission names
       * @param [toParams] {Object} UI-Router params object
       * @returns {promise} $q.promise object
       */
      function authorize(permissionsMap, toParams) {
        return handleAuthorization(permissionsMap, toParams);
      }

      /**
       * Handles authorization based on provided permissions map
       * @private
       *
       * @param permissionsMap {Object} Map of permission names
       * @param toParams {Object} UI-Router params object
       * @returns {promise} $q.promise object
       */
      function handleAuthorization(permissionsMap, toParams) {
        var deferred = $q.defer();

        var exceptPromises = findMatchingPermissions(permissionsMap.except, toParams);

        only(exceptPromises)
          .then(function (rejectedPermissions) {
            deferred.reject(rejectedPermissions);
          })
          .catch(function () {
            if (!permissionsMap.only.length) {
              deferred.resolve(null);
            }

            var onlyPromises = findMatchingPermissions(permissionsMap.only, toParams);

            only(onlyPromises)
              .then(function (resolvedPermissions) {
                deferred.resolve(resolvedPermissions);
              })
              .catch(function (rejectedPermission) {
                deferred.reject(rejectedPermission);
              });
          });

        return deferred.promise;
      }

      /**
       * Implementation of missing $q `only` method that wits for first
       * resolution of provided promise set.
       * @private
       *
       * @param promises {Array|promise} Single or set of promises
       * @returns {Promise} Returns a single promise that will be rejected with an array/hash of values,
       *  each value corresponding to the promise at the same index/key in the `promises` array/hash.
       *  If any of the promises is resolved, this resulting promise will be returned
       *  with the same resolution value.
       */
      function only(promises) {
        var deferred = $q.defer(),
          counter = 0,
          results = angular.isArray(promises) ? [] : {};

        angular.forEach(promises, function (promise, key) {
          counter++;
          $q.when(promise)
            .then(function (value) {
              if (results.hasOwnProperty(key)) {
                return;
              }
              deferred.resolve(value);
            })
            .catch(function (reason) {
              if (results.hasOwnProperty(key)) {
                return;
              }
              results[key] = reason;
              if (!(--counter)) {
                deferred.reject(reason);
              }
            });
        });

        if (counter === 0) {
          deferred.reject(results);
        }

        return deferred.promise;
      }

      /**
       * Performs iteration over list of defined permissions looking for matches
       * @private
       *
       * @param permissionNames {Array} Set of permission names
       * @param toParams {Object} UI-Router params object
       * @returns {Array} Promise collection
       */
      function findMatchingPermissions(permissionNames, toParams) {
        return permissionNames.map(function (permissionName) {
            if (RoleStore.hasRoleDefinition(permissionName)) {
              var role = RoleStore.getRoleDefinition(permissionName);
              return role.validateRole(toParams);
            }

            if (PermissionStore.hasPermissionDefinition(permissionName)) {
              var permission = PermissionStore.getPermissionDefinition(permissionName);
              return permission.validatePermission(toParams);
            }

            if (permissionName) {
              return $q.reject(permissionName);
            }
          });
      }
    });
})();
