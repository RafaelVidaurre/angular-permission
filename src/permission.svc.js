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
        console.warn('Function "defineRole" will be deprecated. Use "definePermission" instead');
        self.definePermission(permission, validationFunction);
        return this;
      };


      /**
       * Allows to define permission on application configuration
       *
       * @param permission {String} Name of defined permission
       * @param validationFunction {Function} Function used to validate if permission is valid
       */
      this.definePermission = function (permission, validationFunction) {
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
      this.defineManyPermissions = function (permissions, validationFunction) {
        if (!angular.isArray(permissions)) {
          throw new TypeError('Parameter "permissions" name must be Array');
        }

        angular.forEach(permissions, function (permissionName) {
          self.definePermission(permissionName, validationFunction);
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
         * @returns {promise} $q.promise object
         */
        function findMatchingRole(permissions, toParams) {
          var deferred = $q.defer();
          var currentPermission = permissions.shift();

          if (angular.isDefined(currentPermission) && angular.isFunction(permissionStore[currentPermission])) {
            var validationResult = permissionStore[currentPermission].call(self, toParams, currentPermission);

            if (!angular.isFunction(validationResult.then)) {
              validationResult = wrapInPromise(validationResult);
            }

            $q.when(validationResult)
              .then(function () {
                deferred.resolve();
              })
              .catch(function () {
                findMatchingRole(permissions, toParams)
                  .then(function () {
                    deferred.resolve();
                  })
                  .catch(function () {
                    deferred.reject();
                  });
              });
          } else {
            // If no roles left to validate reject promise
            deferred.reject();
          }

          return deferred.promise;
        }

        /**
         * Resolves promise if search permission is found
         * @private
         *
         * @param permissions {Array} Set of permission names
         * @param toParams {Object} UI-Router params object
         * @returns {promise} $q.promise object
         */
        function resolveIfMatch(permissions, toParams) {
          var deferred = $q.defer();

          findMatchingRole(permissions, toParams)
            .then(function () {
              deferred.resolve();
            })
            .catch(function () {
              deferred.reject();
            });

          return deferred.promise;
        }

        /**
         * Resolves promise if search permission is missing
         * @private
         *
         * @param permissions {Array} Set of permission names
         * @param toParams {Object} UI-Router params object
         * @returns {promise} $q.promise object
         */
        function rejectIfMatch(permissions, toParams) {
          var deferred = $q.defer();

          findMatchingRole(permissions, toParams)
            .then(function () {
              deferred.reject();
            })
            .catch(function () {
              deferred.resolve();
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
            console.warn('Function "defineRole" will be deprecated. Use "definePermission" instead');
            self.definePermission(permission, validationFunction);
            return Permission;
          },

          /**
           * Allows to define permission in runtime
           *
           * @param permission {String} Name of defined permission
           * @param validationFunction {Function} Function used to validate if permission is valid
           */
          definePermission: function (permission, validationFunction) {
            self.definePermission(permission, validationFunction);
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
            console.warn('Function "defineManyRoles" will be deprecated. Use "defineManyPermissions" instead');
            self.defineManyPermissions(permissions, validationFunction);
            return Permission;
          },

          /**
           * Allows to define set of permissions with shared validation function in runtime
           *
           * @param permissions {Array} Set of permission names
           * @param validationFunction {Function} Function used to validate if permission is valid
           */
          defineManyPermissions: function (permissions, validationFunction) {
            self.defineManyPermissions(permissions, validationFunction);
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
           * @param permissionsMap {Object} Map of "only" or "except" permission names
           * @param toParams {Object} UI-Router params object
           * @returns {promise} $q.promise object
           */
          authorize: function (permissionsMap, toParams) {
            var result;

            validatePermissionMap(permissionsMap);

            if (angular.isDefined(permissionsMap.only)) {
              result = resolveIfMatch(angular.copy(permissionsMap.only), toParams);
            } else {
              result = rejectIfMatch(angular.copy(permissionsMap.except), toParams);
            }

            return result;
          }
        };

        return Permission;
      }];
    });
})();