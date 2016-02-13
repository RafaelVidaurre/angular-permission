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

        allSettled(exceptPromises)
          .then(function (rejectedPermissions) {
            if (rejectedPermissions.length) {
              deferred.reject(rejectedPermissions[0]);
            }

            return $q.reject(null);
          })
          .catch(function () {
            if (!permissionsMap.only.length) {
              deferred.resolve(null);
            }
            var onlyPromises = findMatchingPermissions(permissionsMap.only, toParams);

            allSettled(onlyPromises)
              .then(function (resolvedPermissions) {
                deferred.resolve(resolvedPermissions[0]);
              })
              .catch(function (rejectedPermission) {

                var resolved = onlyPromises.filter(function (promise) {
                  return promise.$$state.status === 1;
                });

                if (resolved.length) {
                  deferred.resolve(resolved);
                } else {
                  deferred.reject(rejectedPermission);
                }
              });
          });

        return deferred.promise;
      }

      /**
       * Waits for all promises to be settled
       * @private
       *
       * @param promises {Array|promise} Set of promises
       * @returns {Promise} Rejected or fulfilled promise collection
       */
      function allSettled(promises) {
        var wrapped = angular.isArray(promises) ? [] : {};
        angular.forEach(promises, function (promise, key) {
          if (!wrapped.hasOwnProperty(key)) {
            wrapped[key] = wrap(promise);
          }
        });
        return $q.all(wrapped);
      }


      function wrap(promise) {
        return $q.when(promise)
          .then(function (value) {
            return $q.resolve(value);
          }, function (reason) {
            return $q.reject(reason);
          });
      }

      /**
       * Performs iteration over list of defined permissions looking for matching roles
       * @private
       *
       * @param permissionNames {Array} Set of permission names
       * @param toParams {Object} UI-Router params object
       * @returns {Array} Promise collection
       */
      function findMatchingPermissions(permissionNames, toParams) {
        return permissionNames.map(function (permissionName) {
          if (RoleStore.hasRoleDefinition(permissionName)) {
            return handleRoleValidation(permissionName, toParams);
          }

          if (PermissionStore.hasPermissionDefinition(permissionName)) {
            return handlePermissionValidation(permissionName, toParams);
          }

          if (permissionName) {
            return $q.reject(permissionName);
          }
        });
      }

      /**
       * Executes role validation checking
       * @private
       *
       * @param roleName {String} Store permission key
       * @param toParams {Object} UI-Router params object
       * @returns {Promise}
       */
      function handleRoleValidation(roleName, toParams) {
        var role = RoleStore.getRoleDefinition(roleName);
        return role.validateRole(toParams);
      }

      /**
       * Executes permission validation checking
       * @private
       *
       * @param permissionName {String} Store permission key
       * @param toParams {Object} UI-Router params object
       * @returns {Promise}
       */
      function handlePermissionValidation(permissionName, toParams) {
        var permission = PermissionStore.getPermissionDefinition(permissionName);
        return permission.validatePermission(toParams);
      }
    });
})();
