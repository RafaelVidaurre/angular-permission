(function () {
  'use strict';

  /**
   * Service responsible for managing and emitting events
   * @name TransitionEvents
   * @memberOf permission
   *
   * @param TransitionProperties {permission.TransitionProperties} Helper storing ui-router transition parameters
   * @param $rootScope {Object} Top-level angular scope
   */
  function TransitionEvents($rootScope, TransitionProperties) {

    this.broadcastStateChangePermissionStart = broadcastStateChangePermissionStart;
    this.broadcastStateChangePermissionAccepted = broadcastStateChangePermissionAccepted;
    this.broadcastStateChangePermissionDenied = broadcastStateChangePermissionDenied;
    this.isStateChangePermissionStartDefaultPrevented = isStateChangePermissionStartDefaultPrevented;

    /**
     * Broadcasts "$stateChangePermissionStart" event from $rootScope
     * @method
     */
    function broadcastStateChangePermissionStart() {
      $rootScope.$broadcast('$stateChangePermissionStart',
        TransitionProperties.toState, TransitionProperties.toParams,
        TransitionProperties.options);
    }

    /**
     * Broadcasts "$stateChangePermissionAccepted" event from $rootScope
     * @method
     */
    function broadcastStateChangePermissionAccepted() {
      $rootScope.$broadcast('$stateChangePermissionAccepted',
        TransitionProperties.toState, TransitionProperties.toParams,
        TransitionProperties.options);
    }

    /**
     * Broadcasts "$tateChangePermissionDenied" event from $rootScope
     * @method
     */
    function broadcastStateChangePermissionDenied() {
      $rootScope.$broadcast('$stateChangePermissionDenied',
        TransitionProperties.toState, TransitionProperties.toParams,
        TransitionProperties.options);
    }

    /**
     * Checks if event $stateChangePermissionStart hasn't been disabled by default
     * @method
     * @private
     *
     * @returns {boolean}
     */
    function isStateChangePermissionStartDefaultPrevented() {
      return $rootScope.$broadcast('$stateChangePermissionStart',
        TransitionProperties.toState, TransitionProperties.toParams,
        TransitionProperties.options).defaultPrevented;
    }
  }

  angular
    .module('permission')
    .service('TransitionEvents', TransitionEvents);

}());