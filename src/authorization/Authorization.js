(function () {
  'use strict';

  angular
    .module('permission')
    .service('Authorization',
      /**
       * @class Authorization
       * @memberOf permission
       *
       * @param $q {$q} Angular promise implementation
       * @param PermissionStore {permission.PermissionStore} Permission definition storage
       * @param RoleStore {permission.RoleStore} Role definition storage
       */
      function ($q, PermissionStore, RoleStore) {
        this.authorize = authorize;

        /**
         * Handles authorization based on provided permissions map
         * @method
         *
         * @param permissionsMap {Object} Map of permission names
         * @param [toParams] {Object} UI-Router params object
         *
         * @returns {promise} $q.promise object
         */
        function authorize(permissionsMap, toParams) {
          var deferred = $q.defer();

          var exceptPromises = resolveAccessRights(permissionsMap.except, toParams);

          $q.all(exceptPromises)
            .then(function (rejectedPermissions) {
              deferred.reject(rejectedPermissions);
            })
            .catch(function () {
              if (!permissionsMap.only.length) {
                deferred.resolve(null);
              }

              var onlyPromises = resolveAccessRights(permissionsMap.only, toParams);

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
         * Performs iteration over list of defined access rights looking for matches
         * @method
         * @private
         *
         * @param accessRightSet {Array} Array of sets of access rights
         * @param toParams {Object} UI-Router params object
         *
         * @returns {Array} Promise collection
         */
        function resolveAccessRights(accessRightSet, toParams) {
          if (accessRightSet.length === 0) {
            return [$q.reject()];
          }

          return accessRightSet.map(function (stateAccessRights) {
            var resolvedStateAccessRights = resolveStateAccessRights(stateAccessRights, toParams);
            return only(resolvedStateAccessRights);
          });
        }

        /**
         * Resolves authorization for compensated state permissions
         * @method
         * @private
         *
         * @param stateAccessRights {Array} Set of access rights
         * @param toParams {Object} UI-Router params object
         * @returns {Array}
         */
        function resolveStateAccessRights(stateAccessRights, toParams) {
          return stateAccessRights.map(function (accessRightName) {
            if (RoleStore.hasRoleDefinition(accessRightName)) {
              var role = RoleStore.getRoleDefinition(accessRightName);
              return role.validateRole(toParams);
            }

            if (PermissionStore.hasPermissionDefinition(accessRightName)) {
              var permission = PermissionStore.getPermissionDefinition(accessRightName);
              return permission.validatePermission(toParams);
            }

            return $q.reject(accessRightName);
          });
        }

        /**
         * Implementation of missing $q `only` method that wits for first resolution of provided promise set
         * @method
         * @private
         *
         * @param promises {Array|promise} Single or set of promises
         *
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
      });
})();
