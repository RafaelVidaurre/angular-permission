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

    this.areStateEventsDefaultPrevented = areStateEventsDefaultPrevented;
    this.broadcastStateChangePermissionStart = broadcastStateChangePermissionStart;
    this.broadcastStateChangePermissionAccepted = broadcastStateChangePermissionAccepted;
    this.broadcastStateChangePermissionDenied = broadcastStateChangePermissionDenied;
    this.broadcastStateChangeSuccess = broadcastStateChangeSuccess;

    /**
     * Checks if state events are not prevented by default
     * @method
     *
     * @returns {boolean}
     */
    function areStateEventsDefaultPrevented() {
      return isStateChangePermissionStartDefaultPrevented() || isStateChangeStartDefaultPrevented();
    }

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
     * Broadcasts "$stateChangeSuccess" event from $rootScope
     * @method
     */
    function broadcastStateChangeSuccess() {
      $rootScope.$broadcast('$stateChangeSuccess',
        TransitionProperties.toState, TransitionProperties.toParams,
        TransitionProperties.fromState, TransitionProperties.fromParams);
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
     * Checks if event $stateChangeStart hasn't been disabled by default
     * @method
     * @private
     *
     * @returns {boolean}
     */
    function isStateChangeStartDefaultPrevented() {
      return $rootScope.$broadcast('$stateChangeStart',
        TransitionProperties.toState, TransitionProperties.toParams,
        TransitionProperties.fromState, TransitionProperties.fromParams,
        TransitionProperties.options).defaultPrevented;
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