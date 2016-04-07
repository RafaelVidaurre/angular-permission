(function () {
  'use strict';

  /**
   * Service responsible for handling state based authorization
   * @name StateAuthorization
   * @memberOf permission
   *
   * @param $q {Object} Angular promise implementation
   * @param $location {Object} Angular location helper service
   * @param $state {Object} Current state provider
   * @param TransitionEvents {permission.TransitionEvents} Event management service
   * @param TransitionProperties {permission.TransitionProperties} Transition properties holder
   */
  function StateAuthorization($q, $location, $state, TransitionEvents, TransitionProperties) {

    /**
     * @type {permission.StatePermissionMap}
     * @private
     */
    var map;

    this.authorize = authorize;

    /**
     * Handles state authorization
     * @method {permission.StatePermissionMap}
     * @param statePermissionMap
     *
     * @return {promise}
     */
    function authorize(statePermissionMap) {
      map = statePermissionMap;

      return authorizeStatePermissionMap()
        .then(function () {
          handleAuthorizedState();
        })
        .catch(function (rejectedPermission) {
          handleUnauthorizedState(rejectedPermission);
        });
    }

    /**
     * Checks authorization for complex state inheritance
     * @method
     * @private
     *
     * @returns {promise} $q.promise object
     */
    function authorizeStatePermissionMap() {
      var deferred = $q.defer();

      resolveExceptStatePermissionMap(deferred);

      return deferred.promise;
    }

    /**
     * Resolves compensated set of "except" privileges
     * @method
     * @private
     *
     * @param deferred {Object} Promise defer
     */
    function resolveExceptStatePermissionMap(deferred) {
      var exceptPromises = resolveStatePermissionMap(map.except);

      $q.all(exceptPromises)
        .then(function (rejectedPermissions) {
          deferred.reject(rejectedPermissions);
        })
        .catch(function () {
          resolveOnlyStatePermissionMap(deferred);
        });
    }

    /**
     * Resolves compensated set of "only" privileges
     * @method
     * @private
     *
     * @param deferred {Object} Promise defer
     */
    function resolveOnlyStatePermissionMap(deferred) {
      if (!map.only.length) {
        deferred.resolve();
        return;
      }

      var onlyPromises = resolveStatePermissionMap(map.only);

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
     * @method
     * @private
     *
     * @param privilegesNames {Array} Array of sets of access rights
     *
     * @returns {Array<Promise>} Promise collection
     */
    function resolveStatePermissionMap(privilegesNames) {
      if (!privilegesNames.length) {
        return [$q.reject()];
      }

      return privilegesNames.map(function (statePrivileges) {
        var resolvedStatePrivileges = map.resolvePropertyValidity(statePrivileges);
        return $q.any(resolvedStatePrivileges);
      });
    }

    /**
     * Handles redirection for authorized access
     * @method
     * @private
     */
    function handleAuthorizedState() {

      TransitionEvents.broadcastStateChangePermissionAccepted();
      $location.replace();

      // Overwrite notify option to broadcast it later
      TransitionProperties.options = angular.extend({}, TransitionProperties.options, {notify: false});

      $state
        .go(TransitionProperties.toState.name, TransitionProperties.toParams, TransitionProperties.options)
        .then(function () {
          TransitionEvents.broadcastStateChangeSuccess();
        });
    }

    /**
     * Handles redirection for unauthorized access
     * @method
     * @private
     *
     * @param rejectedPermission {String} Rejected access right
     */
    function handleUnauthorizedState(rejectedPermission) {
      TransitionEvents.broadcastStateChangePermissionDenied();

      map
        .resolveRedirectState(rejectedPermission)
        .then(function (redirect) {
          $state.go(redirect.state, redirect.params, redirect.options);
        });
    }
  }

  angular
    .module('permission')
    .service('StateAuthorization', StateAuthorization);

})();
