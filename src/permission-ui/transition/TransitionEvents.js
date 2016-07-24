'use strict';

/**
 * Service responsible for managing and emitting events
 * @name permission.ui.permTransitionEvents
 *
 * @extends permission.permTransitionEvents
 *
 * @param $delegate {Object} Parent instance being extended
 * @param $rootScope {Object} Top-level angular scope
 * @param permTransitionProperties {permission.permTransitionProperties} Helper storing transition parameters
 * @param permTransitionEventNames {permission.ui.permTransitionEventNames} Constant storing event names
 */
function permTransitionEvents($delegate, $rootScope, permTransitionProperties, permTransitionEventNames) {
  'ngInject';

  $delegate.areEventsDefaultPrevented = areEventsDefaultPrevented;
  $delegate.broadcastStateChangeSuccessEvent = broadcastStateChangeSuccessEvent;
  $delegate.broadcastPermissionStartEvent = broadcastPermissionStartEvent;
  $delegate.broadcastPermissionAcceptedEvent = broadcastPermissionAcceptedEvent;
  $delegate.broadcastPermissionDeniedEvent = broadcastPermissionDeniedEvent;

  /**
   * Checks if state events are not prevented by default
   * @methodOf permission.ui.permTransitionEvents
   *
   * @returns {boolean}
   */
  function areEventsDefaultPrevented() {
    return isStateChangePermissionStartDefaultPrevented() || isStateChangeStartDefaultPrevented();
  }

  /**
   * Broadcasts "$stateChangePermissionStart" event from $rootScope
   * @methodOf permission.ui.permTransitionEvents
   */
  function broadcastPermissionStartEvent() {
    $rootScope.$broadcast(permTransitionEventNames.permissionStart,
      permTransitionProperties.toState, permTransitionProperties.toParams,
      permTransitionProperties.options);
  }

  /**
   * Broadcasts "$stateChangePermissionAccepted" event from $rootScope
   * @methodOf permission.ui.permTransitionEvents
   */
  function broadcastPermissionAcceptedEvent() {
    $rootScope.$broadcast(permTransitionEventNames.permissionAccepted,
      permTransitionProperties.toState, permTransitionProperties.toParams,
      permTransitionProperties.options);
  }

  /**
   * Broadcasts "$tateChangePermissionDenied" event from $rootScope
   * @methodOf permission.ui.permTransitionEvents
   */
  function broadcastPermissionDeniedEvent() {
    $rootScope.$broadcast(permTransitionEventNames.permissionDenies,
      permTransitionProperties.toState, permTransitionProperties.toParams,
      permTransitionProperties.options);
  }

  /**
   * Broadcasts "$stateChangeSuccess" event from $rootScope
   * @methodOf permission.ui.permTransitionEvents
   */
  function broadcastStateChangeSuccessEvent() {
    $rootScope.$broadcast('$stateChangeSuccess',
      permTransitionProperties.toState, permTransitionProperties.toParams,
      permTransitionProperties.fromState, permTransitionProperties.fromParams);
  }

  /**
   * Checks if event $stateChangePermissionStart hasn't been disabled by default
   * @methodOf permission.ui.permTransitionEvents
   * @private
   *
   * @returns {boolean}
   */
  function isStateChangePermissionStartDefaultPrevented() {
    return $rootScope.$broadcast(permTransitionEventNames.permissionStart,
      permTransitionProperties.toState, permTransitionProperties.toParams,
      permTransitionProperties.options).defaultPrevented;
  }

  /**
   * Checks if event $stateChangeStart hasn't been disabled by default
   * @methodOf permission.ui.permTransitionEvents
   * @private
   *
   * @returns {boolean}
   */
  function isStateChangeStartDefaultPrevented() {
    return $rootScope.$broadcast('$stateChangeStart',
      permTransitionProperties.toState, permTransitionProperties.toParams,
      permTransitionProperties.fromState, permTransitionProperties.fromParams,
      permTransitionProperties.options).defaultPrevented;
  }

  return $delegate;
}

angular
  .module('permission.ui')
  .decorator('permTransitionEvents', permTransitionEvents);