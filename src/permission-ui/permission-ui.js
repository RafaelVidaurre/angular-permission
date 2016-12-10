'use strict';

/**
 * @namespace permission.ui
 */

/**
 * @param $stateProvider {Object}
 */
function config($stateProvider) {
  'ngInject';

  $stateProvider.decorator('$state', function (state) {
    /**
     * Property containing full state object definition
     *
     * This decorator is required to access full state object instead of just it's configuration
     * Can be removed when implemented https://github.com/angular-ui/ui-router/issues/13.
     *
     * @returns {Object}
     */
    state.self.$$permissionState = function () {
      return state;
    };

    return state;
  });
}

/**
 * @param $delegate {Object} The $state decorator delegate
 * @param $q {Object}
 * @param $rootScope {Object}
 * @param PermTransitionProperties {permission.PermTransitionProperties}
 * @param PermTransitionEvents {permission.ui.PermTransitionEvents}
 * @param PermStateAuthorization {permission.ui.PermStateAuthorization}
 * @param PermStatePermissionMap {permission.ui.PermStatePermissionMap}
 */
function state($delegate, $q, $rootScope, PermTransitionProperties, PermTransitionEvents, PermStateAuthorization, PermStatePermissionMap) {
  'ngInject';

  var $state = $delegate;
  // Expose only for testing purposes
  $state.$$transitionTo = $state.transitionTo;

  $state.transitionTo = function(to, toParams, options) {
    // Similar param normalization as in $state.transitionTo
    toParams = toParams || {};
    options = angular.extend({
      location: true, inherit: false, relative: null, notify: true, reload: false, $retry: false
    }, options || {});
    var toState, fromState = $state.current, fromParams = $state.params;
    var name = angular.isString(to) ? to : to.name;

    if (!options.relative && isRelative(name)) {
      throw new Error('No reference point given for path \''  + name + '\'');
    }

    toState = $state.get(name, options.relative);

    if (!toState) {
      throw new Error('Unfound state \'' + name + '\'');
    }

    setTransitionProperties();

    // Maintain UI-Router behavior when $stateChangeStart or $stateChangePermissionStart is cancelled
    if (PermTransitionEvents.areEventsDefaultPrevented()) {
      return delegateTransitionTo();
    }
    
    var statePermissionMap = new PermStatePermissionMap(PermTransitionProperties.toState);

    return PermStateAuthorization
      .authorizeByPermissionMap(statePermissionMap)
      .then(handleAuthorizedState, handleUnauthorizedState(statePermissionMap));

    /**
     * True if the stateName is a relative name, to an parent state
     * @method
     * @private

     * @param status {string} Name of state
     * @returns {boolean}
     */
    function isRelative(stateName) {
      return stateName.indexOf('.') === 0 || stateName.indexOf('^') === 0;
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
     * Performs $state.transitionTo with parameters
     * @method
     * @private
     * 
     * @returns {Promise}
     */
    function delegateTransitionTo() {
      return $state.$$transitionTo(PermTransitionProperties.toState.name, 
        PermTransitionProperties.toParams, PermTransitionProperties.options);
    }

    /**
     * Handles redirection for authorized access
     * @method
     * @private
     */
    function handleAuthorizedState() {
      PermTransitionEvents.broadcastPermissionAcceptedEvent();

      return delegateTransitionTo();
    }

    /**
     * Handles redirection for unauthorized access
     * @method
     * @private
     *
     * @param statePermissionMap {permission.ui.PermPermissionMap} State permission map
     * @returns {Function} A function that accepts the rejectedPermission access right
     */
    function handleUnauthorizedState(statePermissionMap) {
      return function(rejectedPermission) {
        PermTransitionEvents.broadcastPermissionDeniedEvent();

        return statePermissionMap
          .resolveRedirectState(rejectedPermission)
          .then(function (redirect) {
            return $state.go(redirect.state, redirect.params, redirect.options);
          });
      };
    }
  };

  return $state;
}

var uiPermission = angular
  .module('permission.ui', ['permission', 'ui.router'])
  .config(config)
  .decorator('$state', state);

if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = uiPermission.name;
}
