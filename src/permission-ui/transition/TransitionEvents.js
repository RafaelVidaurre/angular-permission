'use strict';

/**
 * Service responsible for managing and emitting events
 * @name permission.ui.TransitionEvents
 *
 * @extends permission.TransitionEvents
 *
 * @param $delegate {Object} Parent instance being extended
 * @param $rootScope {Object} Top-level angular scope
 * @param TransitionProperties {permission.TransitionProperties} Helper storing transition parameters
 * @param TransitionEventNames {permission.ui.TransitionEventNames} Constant storing event names
 */
function TransitionEvents($delegate, $rootScope, TransitionProperties, TransitionEventNames) {
  'ngInject';

  $delegate.areEventsDefaultPrevented = areEventsDefaultPrevented;
  $delegate.broadcastStateChangeSuccessEvent = broadcastStateChangeSuccessEvent;
  $delegate.broadcastPermissionStartEvent = broadcastPermissionStartEvent;
  $delegate.broadcastPermissionAcceptedEvent = broadcastPermissionAcceptedEvent;
  $delegate.broadcastPermissionDeniedEvent = broadcastPermissionDeniedEvent;

  /**
   * Checks if state events are not prevented by default
   * @methodOf permission.ui.TransitionEvents
   *
   * @returns {boolean}
   */
  function areEventsDefaultPrevented() {
    return isStateChangePermissionStartDefaultPrevented() || isStateChangeStartDefaultPrevented();
  }

  /**
   * Broadcasts "$stateChangePermissionStart" event from $rootScope
   * @methodOf permission.ui.TransitionEvents
   */
  function broadcastPermissionStartEvent() {
    $rootScope.$broadcast(TransitionEventNames.permissionStart,
      TransitionProperties.toState, TransitionProperties.toParams,
      TransitionProperties.options);
  }

  /**
   * Broadcasts "$stateChangePermissionAccepted" event from $rootScope
   * @methodOf permission.ui.TransitionEvents
   */
  function broadcastPermissionAcceptedEvent() {
    $rootScope.$broadcast(TransitionEventNames.permissionAccepted,
      TransitionProperties.toState, TransitionProperties.toParams,
      TransitionProperties.options);
  }

  /**
   * Broadcasts "$tateChangePermissionDenied" event from $rootScope
   * @methodOf permission.ui.TransitionEvents
   */
  function broadcastPermissionDeniedEvent() {
    $rootScope.$broadcast(TransitionEventNames.permissionDenies,
      TransitionProperties.toState, TransitionProperties.toParams,
      TransitionProperties.options);
  }

  /**
   * Broadcasts "$stateChangeSuccess" event from $rootScope
   * @methodOf permission.ui.TransitionEvents
   */
  function broadcastStateChangeSuccessEvent() {
    $rootScope.$broadcast('$stateChangeSuccess',
      TransitionProperties.toState, TransitionProperties.toParams,
      TransitionProperties.fromState, TransitionProperties.fromParams);
  }

  /**
   * Checks if event $stateChangePermissionStart hasn't been disabled by default
   * @methodOf permission.ui.TransitionEvents
   * @private
   *
   * @returns {boolean}
   */
  function isStateChangePermissionStartDefaultPrevented() {
    return $rootScope.$broadcast(TransitionEventNames.permissionStart,
      TransitionProperties.toState, TransitionProperties.toParams,
      TransitionProperties.options).defaultPrevented;
  }

  /**
   * Checks if event $stateChangeStart hasn't been disabled by default
   * @methodOf permission.ui.TransitionEvents
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

  return $delegate;
}

angular
  .module('permission.ui')
  .decorator('TransitionEvents', TransitionEvents);