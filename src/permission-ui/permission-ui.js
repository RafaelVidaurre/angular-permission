'use strict';

/**
 * @namespace permission.ui
 */

/**
 * @param $stateProvider {Object}
 */
function config($stateProvider) {
  'ngInject';

  $stateProvider.decorator('parent', function (state, parentFn) {
    /**
     * Property containing full state object definition
     *
     * This decorator is required to access full state object instead of just it's configuration
     * Can be removed when implemented https://github.com/angular-ui/ui-router/issues/13.
     *
     * @returns {Object}
     */
    state.self.$$state = function () {
      return state;
    };

    return parentFn(state);
  });
}

/**
 * @param $rootScope {Object}
 * @param $state {Object}
 * @param permTransitionProperties {permission.permTransitionProperties}
 * @param permTransitionEvents {permission.ui.permTransitionEvents}
 * @param permStateAuthorization {permission.ui.permStateAuthorization}
 * @param permStatePermissionMap {permission.ui.permStatePermissionMap}
 */
function run($rootScope, $state, permTransitionProperties, permTransitionEvents, permStateAuthorization, permStatePermissionMap) {
  'ngInject';

  /**
   * State transition interceptor
   */
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {

    if (!isAuthorizationFinished()) {
      setStateAuthorizationStatus(true);
      setTransitionProperties();

      if (!permTransitionEvents.areEventsDefaultPrevented()) {
        permTransitionEvents.broadcastPermissionStartEvent();

        event.preventDefault();
        var statePermissionMap = new permStatePermissionMap(permTransitionProperties.toState);

        permStateAuthorization
          .authorize(statePermissionMap)
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
     * Updates values of `permTransitionProperties` holder object
     * @method
     * @private
     */
    function setTransitionProperties() {
      permTransitionProperties.toState = toState;
      permTransitionProperties.toParams = toParams;
      permTransitionProperties.fromState = fromState;
      permTransitionProperties.fromParams = fromParams;
      permTransitionProperties.options = options;
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
      permTransitionEvents.broadcastPermissionAcceptedEvent();

      // Overwrite notify option to broadcast it later
      var transitionOptions = angular.extend({}, permTransitionProperties.options, {notify: false, location: true});

      $state
        .go(permTransitionProperties.toState.name, permTransitionProperties.toParams, transitionOptions)
        .then(function () {
          permTransitionEvents.broadcastStateChangeSuccessEvent();
        });
    }

    /**
     * Handles redirection for unauthorized access
     * @method
     * @private
     *
     * @param rejectedPermission {String} Rejected access right
     * @param statePermissionMap {PermissionMap} State permission map
     */
    function handleUnauthorizedState(rejectedPermission, statePermissionMap) {
      permTransitionEvents.broadcastPermissionDeniedEvent();

      statePermissionMap
        .resolveRedirectState(rejectedPermission)
        .then(function (redirect) {
          $state.go(redirect.state, redirect.params, redirect.options);
        });
    }
  });
}

var uiPermission = angular
  .module('permission.ui', ['permission', 'ui.router'])
  .config(config)
  .run(run);

if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = uiPermission.name;
}
