(function () {
  'use strict';

  angular.module('permission')
    .provider('Authorization', function () {
      var customMatchingPermissionsFunction;

      this.setCustomMatchingPermissionsFunction = setCustomMatchingPermissionsFunction;

      /**
       *
       * @param matchingFunction {Function}
       */
      function setCustomMatchingPermissionsFunction(matchingFunction) {
        customMatchingPermissionsFunction = matchingFunction;
      }

      this.$get = ['$q', 'Permission', function ($q, Permission) {
        var findMatchingPermissions = customMatchingPermissionsFunction || defaultFindMatchingPermissions;

        return {
          authorize: authorize
        };

        /**
         * Checks if provided permissions are acceptable
         *
         * @param permissionsMap {Object} Map of "only" and "except" permission names
         * @param toParams {Object} UI-Router params object
         * @returns {promise} $q.promise object
         */
        function authorize(permissionsMap, toParams) {
          validatePermissionMap(permissionsMap);
          return handleAuthorization(permissionsMap, toParams);
        }

        /**
         * Checks if provided permission map has accepted parameter types
         * @private
         *
         * @param permissionMap {Object}
         */
        function validatePermissionMap(permissionMap) {
          if (!angular.isObject(permissionMap)) {
            throw new TypeError('Parameter "permissionMap" has to be Object');
          }

          if (angular.isUndefined(permissionMap.only) && angular.isUndefined(permissionMap.except)) {
            throw new ReferenceError('Either "only" or "except" keys must me defined');
          }

          if (!(angular.isArray(permissionMap.only) || angular.isArray(permissionMap.except))) {
            throw new TypeError('Parameter "permissionMap" properties must be Array');
          }
        }

        /**
         * Handles authorization based on provided permissions map
         * @private
         *
         * @param permissionsMap {Object} Map of "only" and "except" permission names
         * @param toParams {Object} UI-Router params object
         * @returns {promise} $q.promise object
         */
        function handleAuthorization(permissionsMap, toParams) {
          var deferred = $q.defer();

          var exceptPromises = findMatchingPermissions(permissionsMap.except, toParams);

          $q.all(exceptPromises)
            .then(function (rejectedPermissions) {
              // If any "except" permissions are found reject authorization
              if (rejectedPermissions.length) {
                deferred.reject(rejectedPermissions);
              } else {
                // If none go to checking "only" permissions
                return $q.reject(null);
              }
            })
            .catch(function () {
              var onlyPromises = findMatchingPermissions(permissionsMap.only, toParams);
              $q.all(onlyPromises)
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
         * Performs iteration over list of defined permissions looking for matching roles
         * @private
         *
         * @param permissions {Array} Set of permission names
         * @param toParams {Object} UI-Router params object
         * @returns {Array} Promise collection
         */
        function defaultFindMatchingPermissions(permissions, toParams) {
          var promises = [];

          angular.forEach(permissions, function (permission) {
            var dfd = $q.defer();

            if (Permission.hasPermission(permission)) {
              var validationResult = Permission
                .getPermission(permission)
                .call(null, toParams, permission);

              if (!angular.isFunction(validationResult.then)) {
                validationResult = wrapInPromise(validationResult);
              }

              validationResult
                .then(function () {
                  dfd.resolve(permission);
                })
                .catch(function () {
                  dfd.reject(permission);
                });
            } else {
              dfd.reject(permission);
            }

            promises.push(dfd.promise);
          });

          return promises;
        }

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
      }];
    });
})();
