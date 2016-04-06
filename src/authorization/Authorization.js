(function () {
  'use strict';

  /**
   * Service responsible for handling view based authorization
   * @name Authorization
   * @memberOf permission
   *
   * @param $q {$q} Angular promise implementation
   * @param PermissionStore {permission.PermissionStore} Permission definition storage
   * @param RoleStore {permission.RoleStore} Role definition storage
   */
  function Authorization($q, PermissionStore, RoleStore) {

    this.authorize = authorize;

    /**
     * Handles authorization based on provided permissions map
     * @method
     *
     * @param permissionsMap {permission.PermissionMap} Map of permission names
     *
     * @returns {promise} $q.promise object
     */
    function authorize(permissionsMap) {
      if (permissionsMap.isStatePermissionMap()) {
        return authorizeStatePermissionMap(permissionsMap);
      } else {
        return authorizePermissionMap(permissionsMap);
      }
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
    function authorizeStatePermissionMap(permissionMap) {
      var deferred = $q.defer();

      resolveExceptStatePermissionMap(permissionMap, deferred);

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
    function resolveExceptStatePermissionMap(permissionMap, deferred) {
      var exceptPromises = resolveStatePermissionMap(permissionMap.except);

      $q.all(exceptPromises)
        .then(function (rejectedPermissions) {
          deferred.reject(rejectedPermissions);
        })
        .catch(function () {
          resolveOnlyStatePermissionMap(permissionMap, deferred);
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
    function resolveOnlyStatePermissionMap(permissionMap, deferred) {
      if (!permissionMap.only.length) {
        deferred.resolve();
        return;
      }

      var onlyPromises = resolveStatePermissionMap(permissionMap.only);

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
    function authorizePermissionMap(permissionMap) {
      var deferred = $q.defer();

      resolveExceptPrivilegeMap(permissionMap, deferred);

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
    function resolveExceptPrivilegeMap(permissionMap, deferred) {
      var exceptPromises = resolvePermissionMap(permissionMap.except);

      $q.any(exceptPromises)
        .then(function (rejectedPermissions) {
          deferred.reject(rejectedPermissions);
        })
        .catch(function () {
          resolveOnlyPermissionMap(permissionMap, deferred);
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
    function resolveOnlyPermissionMap(permissionMap, deferred) {
      if (!permissionMap.only.length) {
        deferred.resolve();
        return;
      }

      var onlyPromises = resolvePermissionMap(permissionMap.only);
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
    function resolveStatePermissionMap(privilegesNames) {
      if (!privilegesNames.length) {
        return [$q.reject()];
      }

      return privilegesNames.map(function (statePrivileges) {
        var resolvedStatePrivileges = resolvePermissionMap(statePrivileges);
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
    function resolvePermissionMap(privilegesNames) {

      return privilegesNames.map(function (privilegeName) {

        if (RoleStore.hasRoleDefinition(privilegeName)) {
          var role = RoleStore.getRoleDefinition(privilegeName);
          return role.validateRole();
        }

        if (PermissionStore.hasPermissionDefinition(privilegeName)) {
          var permission = PermissionStore.getPermissionDefinition(privilegeName);
          return permission.validatePermission();
        }

        return $q.reject(privilegeName);
      });
    }
  }

  angular
    .module('permission')
    .service('Authorization', Authorization);

})();
