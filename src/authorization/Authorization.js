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

        var $$toParams;

        /**
         * Handles authorization based on provided permissions map
         * @method
         *
         * @param permissionsMap {permission.PermissionMap} Map of permission names
         * @param [toParams] {Object} UI-Router params object
         *
         * @returns {promise} $q.promise object
         */
        function authorize(permissionsMap, toParams) {
          $$toParams = toParams;

          if (isCompensatedMap(permissionsMap)) {
            return authorizeCompensatedMap(permissionsMap);
          }

          return authorizeFlatPrivilegedMap(permissionsMap);
        }

        /**
         * Checks if provided map is compensated or not
         *
         * @param permissionMap {Object} Map of permission names
         * @returns {boolean}
         */
        function isCompensatedMap(permissionMap) {
          return !!((angular.isArray(permissionMap.only[0])) || angular.isArray(permissionMap.except[0]));
        }

        /**
         * Checks authorization for complex state inheritance
         * @method
         * @private
         *
         * @param permissionMap {permission.PermissionMap} Map of privileges
         *
         * @returns {promise} $q.promise object
         */
        function authorizeCompensatedMap(permissionMap) {
          var deferred = $q.defer();

          resolveCompensatedExceptPrivilegeMap(permissionMap, deferred);

          return deferred.promise;
        }

        /**
         * Resolves compensated set of "except" privileges
         * @method
         * @private
         *
         * @param permissionMap {permission.PermissionMap} Map of privileges
         * @param deferred {Object} Promise defer
         */
        function resolveCompensatedExceptPrivilegeMap(permissionMap, deferred) {
          var exceptPromises = resolveCompensatedPrivilegeMap(permissionMap.except);

          $q.all(exceptPromises)
            .then(function (rejectedPermissions) {
              deferred.reject(rejectedPermissions);
            })
            .catch(function () {
              resolveCompensatedOnlyPrivilegeMap(permissionMap, deferred);
            });

        }

        /**
         * Resolves compensated set of "only" privileges
         * @method
         * @private
         *
         * @param permissionMap {permission.PermissionMap} Map of privileges
         * @param deferred {Object} Promise defer
         */
        function resolveCompensatedOnlyPrivilegeMap(permissionMap, deferred) {
          if (!permissionMap.only.length) {
            deferred.resolve();
            return;
          }

          var onlyPromises = resolveCompensatedPrivilegeMap(permissionMap.only);

          $q.all(onlyPromises)
            .then(function (resolvedPermissions) {
              deferred.resolve(resolvedPermissions);
            })
            .catch(function (rejectedPermission) {
              deferred.reject(rejectedPermission);
            });
        }

        /**
         * Checks authorization for simple view based access
         * @method
         * @private
         *
         * @param permissionMap {permission.PermissionMap} Map of privileges
         *
         * @returns {promise} $q.promise object
         */
        function authorizeFlatPrivilegedMap(permissionMap) {
          var deferred = $q.defer();

          resolveFlatExceptPrivilegeMap(permissionMap, deferred);

          return deferred.promise;
        }

        /**
         * Resolves flat set of "except" privileges
         * @method
         * @private
         *
         * @param permissionMap {permission.PermissionMap} Map of privileges
         * @param deferred {Object} Promise defer
         *
         * @returns {promise} $q.promise object
         */
        function resolveFlatExceptPrivilegeMap(permissionMap, deferred) {
          var exceptPromises = resolvePrivilegeMap(permissionMap.except);

          $q.any(exceptPromises)
            .then(function (rejectedPermissions) {
              deferred.reject(rejectedPermissions);
            })
            .catch(function () {
              resolveFlatOnlyPrivilegeMap(permissionMap, deferred);
            });
        }

        /**
         * Resolves flat set of "only" privileges
         * @method
         * @private
         *
         * @param permissionMap {permission.PermissionMap} Map of privileges
         * @param deferred {Object} Promise defer
         */
        function resolveFlatOnlyPrivilegeMap(permissionMap, deferred) {
          if (!permissionMap.only.length) {
            deferred.resolve();
            return;
          }

          var onlyPromises = resolvePrivilegeMap(permissionMap.only);
          $q.any(onlyPromises)
            .then(function (resolvedPermissions) {
              deferred.resolve(resolvedPermissions);
            })
            .catch(function (rejectedPermission) {
              deferred.reject(rejectedPermission);
            });
        }

        /**
         * Performs iteration over list of privileges looking for matches
         * @method
         * @private
         *
         * @param privilegesNames {Array} Array of sets of access rights
         *
         * @returns {Array} Promise collection
         */
        function resolveCompensatedPrivilegeMap(privilegesNames) {
          if (!privilegesNames.length) {
            return [$q.reject()];
          }

          return privilegesNames.map(function (statePrivileges) {
            var resolvedStatePrivileges = resolvePrivilegeMap(statePrivileges);
            return $q.any(resolvedStatePrivileges);
          });
        }

        /**
         * Resolves authorization for flat list state privileges
         * @method
         * @private
         *
         * @param privilegesNames {Array} Set of privileges
         * @returns {Array}
         */
        function resolvePrivilegeMap(privilegesNames) {
          return privilegesNames.map(function (privilegeName) {

            if (RoleStore.hasRoleDefinition(privilegeName)) {
              var role = RoleStore.getRoleDefinition(privilegeName);
              return role.validateRole($$toParams);
            }

            if (PermissionStore.hasPermissionDefinition(privilegeName)) {
              var permission = PermissionStore.getPermissionDefinition(privilegeName);
              return permission.validatePermission($$toParams);
            }

            return $q.reject(privilegeName);
          });
        }
      });
})();
