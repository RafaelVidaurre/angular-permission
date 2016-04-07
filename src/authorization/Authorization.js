(function () {
  'use strict';

  /**
   * Service responsible for handling view based authorization
   * @name Authorization
   * @memberOf permission
   *
   * @param $q {Object} Angular promise implementation
   */
  function Authorization($q) {

    /**
     * @type {permission.PermissionMap}
     * @private
     */
    var map;

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
      map = permissionsMap;

      return authorizePermissionMap();
    }

    /**
     * Checks authorization for simple view based access
     * @method
     * @private
     *
     * @returns {promise} $q.promise object
     */
    function authorizePermissionMap() {
      var deferred = $q.defer();

      resolveExceptPrivilegeMap(deferred);

      return deferred.promise;
    }

    /**
     * Resolves flat set of "except" privileges
     * @method
     * @private
     *
     * @param deferred {Object} Promise defer
     *
     * @returns {Promise} $q.promise object
     */
    function resolveExceptPrivilegeMap(deferred) {
      var exceptPromises = map.resolvePropertyValidity(map.except);

      $q.any(exceptPromises)
        .then(function (rejectedPermissions) {
          deferred.reject(rejectedPermissions);
        })
        .catch(function () {
          resolveOnlyPermissionMap(deferred);
        });
    }

    /**
     * Resolves flat set of "only" privileges
     * @method
     * @private
     *
     * @param deferred {Object} Promise defer
     */
    function resolveOnlyPermissionMap(deferred) {
      if (!map.only.length) {
        deferred.resolve();
        return;
      }

      var onlyPromises = map.resolvePropertyValidity(map.only);
      $q.any(onlyPromises)
        .then(function (resolvedPermissions) {
          deferred.resolve(resolvedPermissions);
        })
        .catch(function (rejectedPermission) {
          deferred.reject(rejectedPermission);
        });
    }
  }

  angular
    .module('permission')
    .service('Authorization', Authorization);

})();
