(function () {
  'use strict';

  angular.module('permission')
    .provider('Permission', function () {
      var permissionStore = {};
      var self = this;

      /**
       * Allows to define permission on application configuration
       * @deprecated
       *
       * @param permission {String} Name of defined permission
       * @param validationFunction {Function} Function used to validate if permission is valid
       */
      this.defineRole = function (permission, validationFunction) {
        console.warn('Function "defineRole" will be deprecated. Use "setPermission" instead');
        self.setPermission(permission, validationFunction);
        return this;
      };


      /**
       * Allows to define permission on application configuration
       *
       * @param permission {String} Name of defined permission
       * @param validationFunction {Function} Function used to validate if permission is valid
       */
      this.setPermission = function (permission, validationFunction) {
        validatePermission(permission, validationFunction);
        permissionStore[permission] = validationFunction;
        return this;
      };

      /**
       * Allows to define set of permissions with shared validation function on application configuration
       *
       * @param permissions {Array} Set of permission names
       * @param validationFunction {Function} Function used to validate if permission is valid
       */
      this.setManyPermissions = function (permissions, validationFunction) {
        if (!angular.isArray(permissions)) {
          throw new TypeError('Parameter "permissions" name must be Array');
        }

        angular.forEach(permissions, function (permissionName) {
          self.setPermission(permissionName, validationFunction);
        });

        return this;
      };

      /**
       * Checks if provided permission has accepted parameter types
       * @private
       *
       * @param permission {String} Name of defined permission
       * @param validationFunction {Function} Function used to validate if permission is valid
       */
      function validatePermission(permission, validationFunction) {
        if (!angular.isString(permission)) {
          throw new TypeError('Parameter "permission" name must be String');
        }
        if (!angular.isFunction(validationFunction)) {
          throw new TypeError('Parameter "validationFunction" must be Function');
        }
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

      this.$get = ['$q', function ($q) {
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
         * Performs iteration over list of defined permissions looking for matching roles
         * @private
         *
         * @param permissions {Array} Set of permission names
         * @param toParams {Object} UI-Router params object
         * @returns {Array} Promise collection
         */
        function findMatchingRole(permissions, toParams) {
          var promises = [];

          angular.forEach(permissions, function (permission) {
            var dfd = $q.defer();

            if (angular.isFunction(permissionStore[permission])) {
              var validationResult = permissionStore[permission].call(null, toParams, permission);

              if (!angular.isFunction(validationResult.then)) {
                validationResult = wrapInPromise(validationResult);
              }

              $q.when(validationResult)
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
         * Authorize user based on provided permissions map
         * @private
         *
         * @param permissionsMap {Object} Map of "only" and "except" permission names
         * @param toParams {Object} UI-Router params object
         * @returns {promise} $q.promise object
         */
        function handleAuthorization(permissionsMap, toParams) {
          var deferred = $q.defer();

          var exceptPromises = findMatchingRole(permissionsMap.except, toParams);

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
              var onlyPromises = findMatchingRole(permissionsMap.only, toParams);
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

        var Permission = {
          /**
           * Allows to define permission in runtime
           * @deprecated
           *
           * @param permission {String} Name of defined permission
           * @param validationFunction {Function} Function used to validate if permission is valid
           */
          defineRole: function (permission, validationFunction) {
            console.warn('Function "defineRole" will be deprecated. Use "setPermission" instead');
            self.setPermission(permission, validationFunction);
            return Permission;
          },

          /**
           * Allows to define permission in runtime
           *
           * @param permission {String} Name of defined permission
           * @param validationFunction {Function} Function used to validate if permission is valid
           */
          setPermission: function (permission, validationFunction) {
            self.setPermission(permission, validationFunction);
            return Permission;
          },

          /**
           * Allows to define set of permissions with shared validation function in runtime
           * @deprecated
           *
           * @param permissions {Array} Set of permission names
           * @param validationFunction {Function} Function used to validate if permission is valid
           */
          defineManyRoles: function (permissions, validationFunction) {
            console.warn('Function "defineManyRoles" will be deprecated. Use "setManyPermissions" instead');
            self.setManyPermissions(permissions, validationFunction);
            return Permission;
          },

          /**
           * Allows to define set of permissions with shared validation function in runtime
           *
           * @param permissions {Array} Set of permission names
           * @param validationFunction {Function} Function used to validate if permission is valid
           */
          setManyPermissions: function (permissions, validationFunction) {
            self.setManyPermissions(permissions, validationFunction);
            return Permission;
          },

          /**
           * Deletes permission
           *
           * @param permission {String} Name of defined permission
           */
          removePermission: function (permission) {
            delete permissionStore[permission];
          },

          /**
           * Deletes set of permissions
           *
           * @param permissions {Array} Set of permission names
           */
          removeManyPermissions: function (permissions) {
            angular.forEach(permissions, function (permission) {
              delete permissionStore[permission];
            });
          },

          /**
           * Checks if permission exists
           *
           * @param permission {String} Name of defined permission
           * @returns {Boolean}
           */
          hasPermission: function (permission) {
            return angular.isDefined(permissionStore[permission]);
          },

          /**
           * Returns all permissions
           *
           * @returns {Object} Permissions collection
           */
          getPermissions: function () {
            return permissionStore;
          },

          /**
           * Removes all permissions
           */
          clearPermissions: function () {
            permissionStore = [];
          },

          /**
           * Checks if provided permissions are acceptable
           *
           * @param permissionsMap {Object} Map of "only" and "except" permission names
           * @param toParams {Object} UI-Router params object
           * @returns {promise} $q.promise object
           */
          authorize: function (permissionsMap, toParams) {
            validatePermissionMap(permissionsMap);
            return handleAuthorization(permissionsMap, toParams);
          }
        };

        return Permission;
      }];
    });
})();