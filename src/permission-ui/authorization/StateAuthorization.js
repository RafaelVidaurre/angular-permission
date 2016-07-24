'use strict';

/**
 * Service responsible for handling inheritance-enabled state-based authorization in ui-router
 * @name permission.ui.permStateAuthorization
 *
 * @param $q {Object} Angular promise implementation
 */
function permStateAuthorization($q) {
  'ngInject';

  this.authorize = authorize;

  /**
   * Handles state authorization
   * @methodOf permission.ui.permStateAuthorization
   *
   * @param statePermissionMap
   *
   * @return {promise}
   */
  function authorize(statePermissionMap) {
    return authorizeStatePermissionMap(statePermissionMap);
  }

  /**
   * Checks authorization for complex state inheritance
   * @methodOf permission.ui.permStateAuthorization
   * @private
   *
   * @param map {permission.ui.StatePermissionMap} State access rights map
   *
   * @returns {promise} $q.promise object
   */
  function authorizeStatePermissionMap(map) {
    var deferred = $q.defer();

    resolveExceptStatePermissionMap(deferred, map);

    return deferred.promise;
  }

  /**
   * Resolves compensated set of "except" privileges
   * @methodOf permission.ui.permStateAuthorization
   * @private
   *
   * @param deferred {Object} Promise defer
   * @param map {permission.ui.StatePermissionMap} State access rights map
   */
  function resolveExceptStatePermissionMap(deferred, map) {
    var exceptPromises = resolveStatePermissionMap(map.except, map);

    $q.all(exceptPromises)
      .then(function (rejectedPermissions) {
        deferred.reject(rejectedPermissions);
      })
      .catch(function () {
        resolveOnlyStatePermissionMap(deferred, map);
      });
  }

  /**
   * Resolves compensated set of "only" privileges
   * @methodOf permission.ui.permStateAuthorization
   * @private
   *
   * @param deferred {Object} Promise defer
   * @param map {permission.ui.StatePermissionMap} State access rights map
   */
  function resolveOnlyStatePermissionMap(deferred, map) {
    if (!map.only.length) {
      deferred.resolve();
      return;
    }

    var onlyPromises = resolveStatePermissionMap(map.only, map);

    $q.all(onlyPromises)
      .then(function (resolvedPermissions) {
        deferred.resolve(resolvedPermissions);
      })
      .catch(function (rejectedPermission) {
        deferred.reject(rejectedPermission);
      });
  }

  /**
   * Performs iteration over list of privileges looking for matches
   * @methodOf permission.ui.permStateAuthorization
   * @private
   *
   * @param privilegesNames {Array} Array of sets of access rights
   * @param map {permission.ui.StatePermissionMap} State access rights map
   *
   * @returns {Array<Promise>} Promise collection
   */
  function resolveStatePermissionMap(privilegesNames, map) {
    if (!privilegesNames.length) {
      return [$q.reject()];
    }

    return privilegesNames.map(function (statePrivileges) {
      var resolvedStatePrivileges = map.resolvePropertyValidity(statePrivileges);
      return $q.any(resolvedStatePrivileges);
    });
  }
}

angular
  .module('permission')
  .service('permStateAuthorization', permStateAuthorization);