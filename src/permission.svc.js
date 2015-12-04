(function () {
  'use strict';

  angular.module('permission')
    .provider('Permission', function () {
      var permissionStore = {};
      var that = this;

      /**
       * Allows to define permission on application configuration
       * @deprecated
       *
       * @param permission {String}
       * @param validationFunction {Function}
       */
      this.defineRole = function (permission, validationFunction) {
        console.warn('Function "defineRole" will be deprecated. Use "definePermission" instead');
        return this.definePermission(permission, validationFunction);
      };


      /**
       * Allows to define permission on application configuration
       *
       * @param permission {String}
       * @param validationFunction {Function}
       */
      this.definePermission = function (permission, validationFunction) {
        validatePermission(permission, validationFunction);
        permissionStore[permission] = validationFunction;
      };

      /**
       * Allows to define set of permissions with shared validation function on application configuration
       *
       * @param permissions {Array}
       * @param validationFunction {Function}
       */
      this.defineManyPermissions = function (permissions, validationFunction) {
        var that = this;

        if (!angular.isArray(permissions)) {
          throw new TypeError('Parameter "permissions" name must be Array');
        }

        angular.forEach(permissions, function (permissionName) {
          that.definePermission(permissionName, validationFunction);
        });
      };

      /**
       * Checks if provided permission has accepted parameter types
       * @private
       *
       * @param permission {String}
       * @param validationFunction {Function}
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
         * Performs iteration over list of defined permissions looking for matching roles
         * @private
         *
         * @param permissions {Array}
         * @param toParams {Object}
         * @returns {Promise}
         */
        function findMatchingRole(permissions, toParams) {
          var deferred = $q.defer();
          var currentPermission = permissions.shift();

          if (angular.isDefined(currentPermission) && angular.isFunction(permissionStore[currentPermission])) {
            var validatedPermission = permissionStore[currentPermission](toParams, currentPermission);

            $q.when(validatedPermission)
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
         * @param permissions {Array}
         * @param toParams {Object}
         * @returns {Promise}
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
         * @param permissions {Array}
         * @param toParams {Object}
         * @returns {Promise}
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
           * @param permission {String}
           * @param validationFunction {Function}
           */
          defineRole: function (permission, validationFunction) {
            console.warn('Function "defineRole" will be deprecated. Use "definePermission" instead');
            Permission.definePermission(permission, validationFunction);
          },

          /**
           * Allows to define permission in runtime
           *
           * @param permission {String}
           * @param validationFunction {Function}
           */
          definePermission: function (permission, validationFunction) {
            that.definePermission(permission, validationFunction);
          },

          /**
           * Allows to define set of permissions with shared validation function in runtime
           * @deprecated
           *
           * @param permissions {Array}
           * @param validationFunction {Function}
           */
          defineManyRoles: function (permissions, validationFunction) {
            console.warn('Function "defineManyRoles" will be deprecated. Use "defineManyPermissions" instead');
            Permission.defineManyPermissions(permissions, validationFunction);
          },

          /**
           * Allows to define set of permissions with shared validation function in runtime
           *
           * @param permissions {Array}
           * @param validationFunction {Function}
           */
          defineManyPermissions: function (permissions, validationFunction) {
            that.defineManyPermissions(permissions, validationFunction);
          },

          /**
           * Deletes permission
           *
           * @param permission {String}
           */
          removePermission: function (permission) {
            delete permissionStore[permission];
          },

          /**
           * Deletes set of permissions
           *
           * @param permissions {Array}
           */
          removeManyPermissions: function (permissions) {
            angular.forEach(permissions, function (permission) {
              delete permissionStore[permission];
            });
          },

          /**
           * Checks if permission exists
           *
           * @param permission {String}
           * @returns {Function}
           */
          hasPermission: function (permission) {
            return angular.isDefined(permissionStore[permission]);
          },

          /**
           * Returns all permissions
           *
           * @returns {Object}
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
           * @param permissionsMap {Object}
           * @param toParams {Object}
           * @returns {Promise}
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