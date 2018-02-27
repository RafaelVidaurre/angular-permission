'use strict';

/**
 * Service responsible for handling inheritance-enabled state-based authorization in ui-router
 * @extends permission.PermPermissionMap
 * @name permission.ui.PermStateAuthorization
 *
 * @param $q {Object} Angular promise implementation
 * @param $state {Object} State object
 * @param PermStatePermissionMap {permission.ui.PermStatePermissionMap|Function} Angular promise implementation
 */
function PermStateAuthorization($q, $state, PermStatePermissionMap) {
  'ngInject';

  this.authorizeByPermissionMap = authorizeByPermissionMap;
  this.authorizeByStateName = authorizeByStateName;

  /**
   * Handles authorization based on provided state permission map
   * @methodOf permission.ui.PermStateAuthorization
   *
   * @param statePermissionMap
   *
   * @return {promise}
   */
  function authorizeByPermissionMap(statePermissionMap,options) {
    return authorizeStatePermissionMap(statePermissionMap,options);
  }

  /**
   * Authorizes uses by provided state name
   * @methodOf permission.ui.PermStateAuthorization
   *
   * @param stateName {String}
   * @returns {promise}
   */
  function authorizeByStateName(stateName,options) {
    var srefState = $state.get(stateName);
    var permissionMap = new PermStatePermissionMap(srefState,options);

    return authorizeByPermissionMap(permissionMap,options);
  }

  /**
   * Checks authorization for complex state inheritance
   * @methodOf permission.ui.PermStateAuthorization
   * @private
   *
   * @param map {permission.ui.StatePermissionMap} State access rights map
   *
   * @returns {promise} $q.promise object
   */
  function authorizeStatePermissionMap(map,options) {
    var deferred = $q.defer();

    resolveExceptStatePermissionMap(deferred, map,options);

    return deferred.promise;
  }

  /**
   * Resolves compensated set of "except" privileges
   * @methodOf permission.ui.PermStateAuthorization
   * @private
   *
   * @param deferred {Object} Promise defer
   * @param map {permission.ui.StatePermissionMap} State access rights map
   */
  function resolveExceptStatePermissionMap(deferred, map,options) {
    var exceptPromises = resolveStatePermissionMap(map.except, map,options);

    // Reverse the promises, so if any "except" privileges are not met, the promise rejects
    $q.all(reversePromises(exceptPromises))
      .then(function () {
        resolveOnlyStatePermissionMap(deferred, map,options);
      })
      .catch(function (rejectedPermissions) {

        if (!angular.isArray(rejectedPermissions)) {
          rejectedPermissions = [rejectedPermissions];
        }

        deferred.reject(rejectedPermissions[0]);
      });
  }

  /**
   * Resolves compensated set of "only" privileges
   * @methodOf permission.ui.PermStateAuthorization
   * @private
   *
   * @param deferred {Object} Promise defer
   * @param map {permission.ui.StatePermissionMap} State access rights map
   */
  function resolveOnlyStatePermissionMap(deferred, map,options) {
    if (!map.only.length) {
      deferred.resolve();
      return;
    }

    var onlyPromises = resolveStatePermissionMap(map.only, map,options);

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
   * @methodOf permission.ui.PermStateAuthorization
   * @private
   *
   * @param privilegesNames {Array} Array of sets of access rights
   * @param map {permission.ui.StatePermissionMap} State access rights map
   *
   * @returns {Array<Promise>} Promise collection
   */
  function resolveStatePermissionMap(privilegesNames, map,options) {
    if (!privilegesNames.length) {
      return [$q.reject()];
    }

    return privilegesNames.map(function (statePrivileges) {
      var resolvedStatePrivileges = map.resolvePropertyValidity(statePrivileges,options);
      return $q.any(resolvedStatePrivileges)
        .then(function (resolvedPermissions) {
          if (angular.isArray(resolvedPermissions)) {
            return resolvedPermissions[0];
          }
          return resolvedPermissions;
        });
    });
  }

  /**
   * Creates an Array of Promises that resolve when rejected, and reject when resolved
   * @methodOf permission.ui.PermStateAuthorization
   * @private
   *
   * @param promises {Array} Array of promises
   *
   * @returns {Array<Promise>} Promise collection
   */
  function reversePromises (promises) {
    return promises.map(function (promise) {
      var d = $q.defer();
      promise.then(d.reject, d.resolve);
      return d.promise;
    });
  }
}

angular
  .module('permission')
  .service('PermStateAuthorization', PermStateAuthorization);