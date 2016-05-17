(function (module) {
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
   * @param TransitionProperties {permission.TransitionProperties}
   * @param TransitionEvents {permission.ui.TransitionEvents}
   * @param StateAuthorization {permission.ui.StateAuthorization}
   * @param StatePermissionMap {permission.ui.StatePermissionMap}
   */
  function run($rootScope, $state, TransitionProperties, TransitionEvents, StateAuthorization, StatePermissionMap) {
    'ngInject';

    /**
     * State transition interceptor
     */
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {

      if (!isAuthorizationFinished()) {
        setStateAuthorizationStatus(true);
        setTransitionProperties();

        if (!TransitionEvents.areEventsDefaultPrevented()) {
          TransitionEvents.broadcastPermissionStartEvent();

          event.preventDefault();
          var statePermissionMap = new StatePermissionMap(TransitionProperties.toState);

          StateAuthorization
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
        }
      }

      /**
       * Updates values of `TransitionProperties` holder object
       * @method
       * @private
       */
      function setTransitionProperties() {
        TransitionProperties.toState = toState;
        TransitionProperties.toParams = toParams;
        TransitionProperties.fromState = fromState;
        TransitionProperties.fromParams = fromParams;
        TransitionProperties.options = options;
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
        TransitionEvents.broadcastPermissionAcceptedEvent();

        // Overwrite notify option to broadcast it later
        var transitionOptions = angular.extend({}, TransitionProperties.options, {notify: false, location: true});

        $state
          .go(TransitionProperties.toState.name, TransitionProperties.toParams, transitionOptions)
          .then(function () {
            TransitionEvents.broadcastStateChangeSuccessEvent();
          });
      }

      /**
       * Handles redirection for unauthorized access
       * @method
       * @private
       *
       * @param rejectedPermission {String} Rejected access right
       * @param statePermissionMap {permission.ui.StatePermissionMap} State permission map
       */
      function handleUnauthorizedState(rejectedPermission, statePermissionMap) {
        TransitionEvents.broadcastPermissionDeniedEvent();

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


  if (angular.isDefined(module)) {
    module.exports = uiPermission.name;
  }

  return uiPermission;
}());
