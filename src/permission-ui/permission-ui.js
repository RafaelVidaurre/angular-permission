'use strict';

/**
 * @namespace permission.ui
 */

/**
 * @param $stateProvider {Object}
 */
function config($stateProvider) {
  'ngInject';

  $stateProvider.decorator('$delegate', function ($delegate) {

    /**
     * Property containing full state object definition
     *
     * This decorator is required to access full state object instead of just it's configuration
     * Can be removed when implemented https://github.com/angular-ui/ui-router/issues/13.
     *
     * @returns {Object}
     */
    $delegate.self.$$permissionState = function () {
      return $delegate;
    };

    return $delegate;
  });
}

/**
 * @param $injector {Object}
 * @param $rootScope {Object}
 * @param $state {Object}
 * @param PermTransitionProperties {permission.PermTransitionProperties}
 * @param PermTransitionEvents {permission.ui.PermTransitionEvents}
 * @param PermStateAuthorization {permission.ui.PermStateAuthorization}
 * @param PermStatePermissionMap {permission.ui.PermStatePermissionMap}
 */
function run($injector, $rootScope, $state, PermTransitionProperties, PermTransitionEvents, PermStateAuthorization, PermStatePermissionMap) {
  'ngInject';

  // For ui-router 1.x use $transitions web hook
  if ($injector.has('$transitions')) {
    var $transitions = $injector.get('$transitions');
    $transitions.onBefore({}, handleOnBeforeWebHook);
    // For ui-router 0.x use old-style eventing
  } else {
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
      handleStateChangeStartEvent(event, toState, toParams, fromState, fromParams, options);
    });
  }

  /**
   * State transition web hook
   * @param transition {Object}
   */
  function handleOnBeforeWebHook(transition) {
    setTransitionProperties(transition);
    var statePermissionMap = new PermStatePermissionMap(PermTransitionProperties.toState);

    return PermStateAuthorization
      .authorizeByPermissionMap(statePermissionMap)
      .catch(function (rejectedPermission) {
        return statePermissionMap
          .resolveRedirectState(rejectedPermission)
          .then(function (redirect) {
            return transition.router.stateService.target(redirect.state, redirect.params, redirect.options);
          });
      });

    /**
     * Updates values of `PermTransitionProperties` holder object
     * @method
     * @private
     */
    function setTransitionProperties(transition) {
      PermTransitionProperties.toState = transition.to();
      PermTransitionProperties.toParams = transition.params('to');
      PermTransitionProperties.fromState = transition.from();
      PermTransitionProperties.fromParams = transition.params('from');
      PermTransitionProperties.options = transition.options();
    }
  }

  /**
   * State transition event interceptor
   */
  function handleStateChangeStartEvent(event, toState, toParams, fromState, fromParams, options) {
    if (!isAuthorizationFinished()) {
      setStateAuthorizationStatus(true);
      setTransitionProperties();

      if (!PermTransitionEvents.areEventsDefaultPrevented()) {
        PermTransitionEvents.broadcastPermissionStartEvent();

        event.preventDefault();
        var statePermissionMap = new PermStatePermissionMap(PermTransitionProperties.toState);

        PermStateAuthorization
          .authorizeByPermissionMap(statePermissionMap)
          .then(function () {
            handleAuthorizedState();
          })
          .catch(function (rejectedPermission) {
            handleUnauthorizedState(rejectedPermission, statePermissionMap);
          })
          .finally(function () {
            setStateAuthorizationStatus(false);
          });
      } else {
        setStateAuthorizationStatus(false);
      }
    }


    /**
     * Updates values of `PermTransitionProperties` holder object
     * @method
     * @private
     */
    function setTransitionProperties() {
      PermTransitionProperties.toState = toState;
      PermTransitionProperties.toParams = toParams;
      PermTransitionProperties.fromState = fromState;
      PermTransitionProperties.fromParams = fromParams;
      PermTransitionProperties.options = options;
    }

    /**
     * Sets internal state `$$finishedAuthorization` variable to prevent looping
     * @method
     * @private
     *
     * @param status {boolean} When true authorization has been already preceded
     */
    function setStateAuthorizationStatus(status) {
      angular.extend(toState, {'$$isAuthorizationFinished': status});
    }

    /**
     * Checks if state has been already checked for authorization
     * @method
     * @private
     *
     * @returns {boolean}
     */
    function isAuthorizationFinished() {
      return toState.$$isAuthorizationFinished;
    }

    /**
     * Handles redirection for authorized access
     * @method
     * @private
     */
    function handleAuthorizedState() {
      PermTransitionEvents.broadcastPermissionAcceptedEvent();

      // Overwrite notify option to broadcast it later
      var transitionOptions = angular.extend({}, PermTransitionProperties.options, {notify: false, location: true});

      $state
        .go(PermTransitionProperties.toState.name, PermTransitionProperties.toParams, transitionOptions)
        .then(function () {
          PermTransitionEvents.broadcastStateChangeSuccessEvent();
        });
    }

    /**
     * Handles redirection for unauthorized access
     * @method
     * @private
     *
     * @param rejectedPermission {String} Rejected access right
     * @param statePermissionMap {permission.ui.PermPermissionMap} State permission map
     */
    function handleUnauthorizedState(rejectedPermission, statePermissionMap) {
      PermTransitionEvents.broadcastPermissionDeniedEvent();

      statePermissionMap
        .resolveRedirectState(rejectedPermission)
        .then(function (redirect) {
          $state.go(redirect.state, redirect.params, redirect.options);
        });
    }
  }
}

var uiPermission = angular
  .module('permission.ui', ['permission', 'ui.router'])
  .config(config)
  .run(run);

if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = uiPermission.name;
}
