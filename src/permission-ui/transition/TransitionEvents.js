'use strict';

/**
 * Service responsible for managing and emitting events
 * @name permission.ui.PermTransitionEvents
 *
 * @extends permission.PermTransitionEvents
 *
 * @param $delegate {Object} Parent instance being extended
 * @param $rootScope {Object} Top-level angular scope
 * @param PermTransitionProperties {permission.PermTransitionProperties} Helper storing transition parameters
 * @param PermTransitionEventNames {permission.ui.PermTransitionEventNames} Constant storing event names
 */
function PermTransitionEvents($delegate, $rootScope, PermTransitionProperties, PermTransitionEventNames) {
  'ngInject';

  $delegate.isStateChangeStartDefaultPrevented = isStateChangeStartDefaultPrevented;
  $delegate.isStateChangePermissionStartDefaultPrevented = isStateChangePermissionStartDefaultPrevented;
  $delegate.broadcastPermissionStartEvent = broadcastPermissionStartEvent;
  $delegate.broadcastPermissionAcceptedEvent = broadcastPermissionAcceptedEvent;
  $delegate.broadcastPermissionDeniedEvent = broadcastPermissionDeniedEvent;

  /**
   * Broadcasts "$stateChangePermissionStart" event from $rootScope
   * @methodOf permission.ui.PermTransitionEvents
   */
  function broadcastPermissionStartEvent() {
    $rootScope.$broadcast(PermTransitionEventNames.permissionStart,
      PermTransitionProperties.toState, PermTransitionProperties.toParams,
      PermTransitionProperties.options);
  }

  /**
   * Broadcasts "$stateChangePermissionAccepted" event from $rootScope
   * @methodOf permission.ui.PermTransitionEvents
   */
  function broadcastPermissionAcceptedEvent() {
    $rootScope.$broadcast(PermTransitionEventNames.permissionAccepted,
      PermTransitionProperties.toState, PermTransitionProperties.toParams,
      PermTransitionProperties.options);
  }

  /**
   * Broadcasts "$tateChangePermissionDenied" event from $rootScope
   * @methodOf permission.ui.PermTransitionEvents
   */
  function broadcastPermissionDeniedEvent() {
    $rootScope.$broadcast(PermTransitionEventNames.permissionDenies,
      PermTransitionProperties.toState, PermTransitionProperties.toParams,
      PermTransitionProperties.options);
  }

  /**
   * Checks if event $stateChangePermissionStart hasn't been disabled by default
   * @methodOf permission.ui.PermTransitionEvents
   *
   * @returns {boolean}
   */
  function isStateChangePermissionStartDefaultPrevented() {
    return $rootScope.$broadcast(PermTransitionEventNames.permissionStart,
      PermTransitionProperties.toState, PermTransitionProperties.toParams,
      PermTransitionProperties.options).defaultPrevented;
  }

  /**
   * Checks if event $stateChangeStart hasn't been disabled by default
   * @methodOf permission.ui.PermTransitionEvents
   *
   * @returns {boolean}
   */
  function isStateChangeStartDefaultPrevented() {
    return $rootScope.$broadcast('$stateChangeStart',
      PermTransitionProperties.toState, PermTransitionProperties.toParams,
      PermTransitionProperties.fromState, PermTransitionProperties.fromParams,
      PermTransitionProperties.options).defaultPrevented;
  }

  return $delegate;
}

angular
  .module('permission.ui')
  .decorator('PermTransitionEvents', PermTransitionEvents);