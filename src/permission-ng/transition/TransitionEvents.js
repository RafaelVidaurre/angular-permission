(function () {
  'use strict';

  /**
   * Service responsible for managing and emitting events
   * @name TransitionEvents
   * @memberOf permission.ng
   *
   * @extends {permission.TransitionEvents}
   *
   * @param $delegate {Object} Parent instance being extended
   * @param $rootScope {Object} Top-level angular scope
   * @param TransitionProperties {permission.TransitionProperties} Helper storing transition parameters
   * @param TransitionEventNames {permission.ng.TransitionEventNames} Constant storing event names
   */
  function TransitionEvents($delegate, $rootScope, TransitionProperties, TransitionEventNames) {

    $delegate.areEventsDefaultPrevented = areEventsDefaultPrevented;
    $delegate.broadcastPermissionStartEvent = broadcastPermissionStartEvent;
    $delegate.broadcastPermissionAcceptedEvent = broadcastPermissionAcceptedEvent;
    $delegate.broadcastPermissionDeniedEvent = broadcastPermissionDeniedEvent;

    /**
     * Checks if state events are not prevented by default
     * @method
     *
     * @returns {boolean}
     */
    function areEventsDefaultPrevented() {
      return isRouteChangePermissionStartDefaultPrevented();
    }

    /**
     * Broadcasts "$routeChangePermissionStart" event from $rootScope
     * @method
     */
    function broadcastPermissionStartEvent() {
      $rootScope.$broadcast(TransitionEventNames.permissionStart,
        TransitionProperties.next, TransitionProperties.current);
    }

    /**
     * Broadcasts "$routeChangePermissionAccepted" event from $rootScope
     * @method
     */
    function broadcastPermissionAcceptedEvent() {
      $rootScope.$broadcast(TransitionEventNames.permissionAccepted,
        TransitionProperties.next, TransitionProperties.current);
    }

    /**
     * Broadcasts "$routeChangePermissionDenied" event from $rootScope
     * @method
     */
    function broadcastPermissionDeniedEvent() {
      $rootScope.$broadcast(TransitionEventNames.permissionDenied,
        TransitionProperties.next, TransitionProperties.current);
    }

    /**
     * Checks if event $routeChangePermissionStart hasn't been disabled by default
     * @method
     * @private
     *
     * @returns {boolean}
     */
    function isRouteChangePermissionStartDefaultPrevented() {
      return $rootScope.$broadcast(TransitionEventNames.permissionStart,
        TransitionProperties.next, TransitionProperties.current).defaultPrevented;
    }

    return $delegate;
  }

  angular
    .module('permission.ng')
    .decorator('TransitionEvents', TransitionEvents);

}());