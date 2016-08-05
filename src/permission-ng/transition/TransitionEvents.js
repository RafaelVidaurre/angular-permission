'use strict';

/**
 * Service responsible for managing and emitting events
 * @name permission.ng.PermTransitionEvents
 *
 * @extends {permission.PermTransitionEvents}
 *
 * @param $delegate {Object} Parent instance being extended
 * @param $rootScope {Object} Top-level angular scope
 * @param PermTransitionProperties {permission.PermTransitionProperties} Helper storing transition parameters
 * @param PermTransitionEventNames {permission.ng.PermTransitionEventNames} Constant storing event names
 */
function PermTransitionEvents($delegate, $rootScope, PermTransitionProperties, PermTransitionEventNames) {
  'ngInject';

  $delegate.areEventsDefaultPrevented = areEventsDefaultPrevented;
  $delegate.broadcastPermissionStartEvent = broadcastPermissionStartEvent;
  $delegate.broadcastPermissionAcceptedEvent = broadcastPermissionAcceptedEvent;
  $delegate.broadcastPermissionDeniedEvent = broadcastPermissionDeniedEvent;

  /**
   * Checks if state events are not prevented by default
   * @methodOf permission.ng.PermTransitionEvents
   *
   * @returns {boolean}
   */
  function areEventsDefaultPrevented() {
    return isRouteChangePermissionStartDefaultPrevented();
  }

  /**
   * Broadcasts "$routeChangePermissionStart" event from $rootScope
   * @methodOf permission.ng.PermTransitionEvents
   */
  function broadcastPermissionStartEvent() {
    $rootScope.$broadcast(PermTransitionEventNames.permissionStart, PermTransitionProperties.next);
  }

  /**
   * Broadcasts "$routeChangePermissionAccepted" event from $rootScope
   * @methodOf permission.ng.PermTransitionEvents
   */
  function broadcastPermissionAcceptedEvent() {
    $rootScope.$broadcast(PermTransitionEventNames.permissionAccepted, PermTransitionProperties.next);
  }

  /**
   * Broadcasts "$routeChangePermissionDenied" event from $rootScope
   * @methodOf permission.ng.PermTransitionEvents
   */
  function broadcastPermissionDeniedEvent() {
    $rootScope.$broadcast(PermTransitionEventNames.permissionDenied, PermTransitionProperties.next);
  }

  /**
   * Checks if event $routeChangePermissionStart hasn't been disabled by default
   * @methodOf permission.ng.PermTransitionEvents
   * @private
   *
   * @returns {boolean}
   */
  function isRouteChangePermissionStartDefaultPrevented() {
    return $rootScope.$broadcast(PermTransitionEventNames.permissionStart, PermTransitionProperties.next).defaultPrevented;
  }

  return $delegate;
}

angular
  .module('permission.ng')
  .decorator('PermTransitionEvents', PermTransitionEvents);