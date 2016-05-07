(function () {
  'use strict';

  /**
   * @namespace permission
   */

  function config($stateProvider) {
    /**
     * This decorator is required to access full state object instead of it's configuration
     * when trying to obtain full toState state object not it's configuration
     * Can be removed when implemented https://github.com/angular-ui/ui-router/issues/13.
     */
    $stateProvider.decorator('parent', function (state, parentFn) {
      state.self.$$state = function () {
        return state;
      };

      state.self.areSetStatePermissions = function () {
        return angular.isDefined(state.data) && angular.isDefined(state.data.permissions);
      };

      return parentFn(state);
    });
  }

  function run($rootScope, $state, TransitionProperties, TransitionEvents, StateAuthorization, StatePermissionMap) {
    /**
     * State transition interceptor
     */
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {

      if (!isAuthorizationFinished()) {
        event.preventDefault();

        setStateAuthorizationStatus(true);
        setTransitionProperties();

        if (!TransitionEvents.areStateEventsDefaultPrevented()) {
          TransitionEvents.broadcastStateChangePermissionStart();

          var statePermissionMap = new StatePermissionMap();

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

        TransitionEvents.broadcastStateChangePermissionAccepted();

        // Overwrite notify option to broadcast it later
        var transitionOptions = angular.extend({}, TransitionProperties.options, {notify: false, location: true});

        $state
          .go(TransitionProperties.toState.name, TransitionProperties.toParams, transitionOptions)
          .then(function () {
            TransitionEvents.broadcastStateChangeSuccess();
          });
      }

      /**
       * Handles redirection for unauthorized access
       * @method
       * @private
       *
       * @param rejectedPermission {String} Rejected access right
       * @param statePermissionMap {permission.StatePermissionMap} State permission map
       */
      function handleUnauthorizedState(rejectedPermission, statePermissionMap) {
        TransitionEvents.broadcastStateChangePermissionDenied();

        statePermissionMap
          .resolveRedirectState(rejectedPermission)
          .then(function (redirect) {
            $state.go(redirect.state, redirect.params, redirect.options);
          });
      }
    });
  }

  angular.module('permission', ['ui.router'])
    .config(config)
    .run(run);
}());
