(function () {
  'use strict';

  angular
    .module('permission')
    .service('Authorization', function ($q, PermissionMap, PermissionStore, RoleStore) {
      this.authorize = authorize;

      /**
       * Checks if provided permissions are acceptable
       *
       * @param permissionsMap {Object} Map of "only" and "except" permission names
       * @param [toParams] {Object} UI-Router params object
       * @returns {promise} $q.promise object
       */
      function authorize(permissionsMap, toParams) {
        return handleAuthorization(new PermissionMap(permissionsMap), toParams);
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

          return $q.reject(permissionName);
        });
      }

      /**
       * Executes role validation checking
       * @private
       *
       * @param roleName {String} Store permission key
       * @param toParams {Object} UI-Router params object
       * @returns {promise}
       */
      function handleRoleValidation(roleName, toParams) {
        var dfd = $q.defer();
        var role = RoleStore.getRoleDefinition(roleName);
        var validationResult = role.validateRole(toParams);

        validationResult
          .then(function () {
            dfd.resolve(roleName);
          })
          .catch(function () {
            dfd.reject(roleName);
          });

        return dfd.promise;
      }

      /**
       * Executes permission validation checking
       * @private
       *
       * @param permissionName {String} Store permission key
       * @param toParams {Object} UI-Router params object
       * @returns {*}
       */
      function handlePermissionValidation(permissionName, toParams) {
        var dfd = $q.defer();
        var permission = PermissionStore.getPermissionDefinition(permissionName);
        var validationResult = permission.validatePermission(toParams);

        validationResult
          .then(function () {
            dfd.resolve(permissionName);
          })
          .catch(function () {
            dfd.reject(permissionName);
          });

        return dfd.promise;
      }
    });
})();
