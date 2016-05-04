(function () {
  'use strict';

  /**
   * Service responsible for managing and emitting events
   * @name permission.ng.TransitionEvents
   *
   * @extends {permission.TransitionEvents}
   *
   * @param $delegate {Object} Parent instance being extended
   * @param $rootScope {Object} Top-level angular scope
   * @param TransitionProperties {permission.TransitionProperties} Helper storing transition parameters
   * @param TransitionEventNames {permission.ng.TransitionEventNames} Constant storing event names
   */
  function TransitionEvents($delegate, $rootScope, TransitionProperties, TransitionEventNames) {
    'ngInject';

    $delegate.areEventsDefaultPrevented = areEventsDefaultPrevented;
    $delegate.broadcastPermissionStartEvent = broadcastPermissionStartEvent;
    $delegate.broadcastPermissionAcceptedEvent = broadcastPermissionAcceptedEvent;
    $delegate.broadcastPermissionDeniedEvent = broadcastPermissionDeniedEvent;

    /**
     * Checks if state events are not prevented by default
     * @methodOf permission.ng.TransitionEvents
     *
     * @returns {boolean}
     */
    function areEventsDefaultPrevented() {
      return isRouteChangePermissionStartDefaultPrevented();
    }

    /**
     * Broadcasts "$routeChangePermissionStart" event from $rootScope
     * @methodOf permission.ng.TransitionEvents
     */
    function broadcastPermissionStartEvent() {
      $rootScope.$broadcast(TransitionEventNames.permissionStart, TransitionProperties.next);
    }

    /**
     * Broadcasts "$routeChangePermissionAccepted" event from $rootScope
     * @methodOf permission.ng.TransitionEvents
     */
    function broadcastPermissionAcceptedEvent() {
      $rootScope.$broadcast(TransitionEventNames.permissionAccepted, TransitionProperties.next);
    }

    /**
     * Broadcasts "$routeChangePermissionDenied" event from $rootScope
     * @methodOf permission.ng.TransitionEvents
     */
    function broadcastPermissionDeniedEvent() {
      $rootScope.$broadcast(TransitionEventNames.permissionDenied, TransitionProperties.next);
    }

    /**
     * Checks if event $routeChangePermissionStart hasn't been disabled by default
     * @methodOf permission.ng.TransitionEvents
     * @private
     *
     * @returns {boolean}
     */
    function isRouteChangePermissionStartDefaultPrevented() {
      return $rootScope.$broadcast(TransitionEventNames.permissionStart, TransitionProperties.next).defaultPrevented;
    }

    return $delegate;
  }

  angular
    .module('permission.ng')
    .decorator('TransitionEvents', TransitionEvents);

}());