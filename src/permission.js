(function () {
  'use strict';

  /**
   * @namespace permission
   */
  var permission = angular.module('permission', ['ui.router']);

  permission.config(function ($stateProvider) {
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
  });

  permission.run(function ($rootScope, TransitionProperties, TransitionEvents, StateAuthorization) {
    /**
     * State transition interceptor
     */
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {

      setTransitionProperties();

      if (!StateAuthorization.isAuthorizationFinished()) {
        event.preventDefault();
        StateAuthorization.setStateAuthorizationStatus(true);

        if (!TransitionEvents.areStateEventsDefaultPrevented()) {
          TransitionEvents.broadcastStateChangePermissionStart();
          StateAuthorization.authorizeForState();
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
    });
  });
}());
