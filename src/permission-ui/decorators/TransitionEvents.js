(function () {
  'use strict';

  /**
   * Service responsible for managing and emitting events
   * @name uiTransitionEvents
   * @memberOf permission.ui
   *
   * @extends {permission.TransitionEvents}
   *
   * @param $delegate {Object} Parent instance being extended
   * @param TransitionProperties {permission.TransitionProperties} Helper storing transition parameters
   * @param $rootScope {Object} Top-level angular scope
   */
  function uiTransitionEvents($delegate, $rootScope, TransitionProperties) {

    $delegate.areStateEventsDefaultPrevented = areStateEventsDefaultPrevented;
    $delegate.broadcastStateChangeSuccess = broadcastStateChangeSuccess;

    /**
     * Checks if state events are not prevented by default
     * @method
     *
     * @returns {boolean}
     */
    function areStateEventsDefaultPrevented() {
      return $delegate.isStateChangePermissionStartDefaultPrevented() || isStateChangeStartDefaultPrevented();
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

    return $delegate;
  }

  angular
    .module('permission.ui')
    .decorator('TransitionEvents', uiTransitionEvents);

}());