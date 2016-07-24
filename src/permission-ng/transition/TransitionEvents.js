'use strict';

/**
 * Service responsible for managing and emitting events
 * @name permission.ng.permTransitionEvents
 *
 * @extends {permission.permTransitionEvents}
 *
 * @param $delegate {Object} Parent instance being extended
 * @param $rootScope {Object} Top-level angular scope
 * @param permTransitionProperties {permission.permTransitionProperties} Helper storing transition parameters
 * @param permTransitionEventNames {permission.ng.permTransitionEventNames} Constant storing event names
 */
function permTransitionEvents($delegate, $rootScope, permTransitionProperties, permTransitionEventNames) {
  'ngInject';

  $delegate.areEventsDefaultPrevented = areEventsDefaultPrevented;
  $delegate.broadcastPermissionStartEvent = broadcastPermissionStartEvent;
  $delegate.broadcastPermissionAcceptedEvent = broadcastPermissionAcceptedEvent;
  $delegate.broadcastPermissionDeniedEvent = broadcastPermissionDeniedEvent;

  /**
   * Checks if state events are not prevented by default
   * @methodOf permission.ng.permTransitionEvents
   *
   * @returns {boolean}
   */
  function areEventsDefaultPrevented() {
    return isRouteChangePermissionStartDefaultPrevented();
  }

  /**
   * Broadcasts "$routeChangePermissionStart" event from $rootScope
   * @methodOf permission.ng.permTransitionEvents
   */
  function broadcastPermissionStartEvent() {
    $rootScope.$broadcast(permTransitionEventNames.permissionStart, permTransitionProperties.next);
  }

  /**
   * Broadcasts "$routeChangePermissionAccepted" event from $rootScope
   * @methodOf permission.ng.permTransitionEvents
   */
  function broadcastPermissionAcceptedEvent() {
    $rootScope.$broadcast(permTransitionEventNames.permissionAccepted, permTransitionProperties.next);
  }

  /**
   * Broadcasts "$routeChangePermissionDenied" event from $rootScope
   * @methodOf permission.ng.permTransitionEvents
   */
  function broadcastPermissionDeniedEvent() {
    $rootScope.$broadcast(permTransitionEventNames.permissionDenied, permTransitionProperties.next);
  }

  /**
   * Checks if event $routeChangePermissionStart hasn't been disabled by default
   * @methodOf permission.ng.permTransitionEvents
   * @private
   *
   * @returns {boolean}
   */
  function isRouteChangePermissionStartDefaultPrevented() {
    return $rootScope.$broadcast(permTransitionEventNames.permissionStart, permTransitionProperties.next).defaultPrevented;
  }

  return $delegate;
}

angular
  .module('permission.ng')
  .decorator('permTransitionEvents', permTransitionEvents);