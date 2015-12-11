(function () {
  'use strict';

  var permission = angular.module('permission', ['ui.router']);

  permission.run(['$rootScope', 'Permission', '$state', '$q', function ($rootScope, Permission, $state, $q) {
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

      if (toState.$$finishAuthorize || !toState.data || !toState.data.permissions) {
        return;
      }

      var permissions = toState.data.permissions;

      event.preventDefault();
      toState = angular.extend({'$$finishAuthorize': true}, toState);

      if ($rootScope.$broadcast('$stateChangePermissionStart', toState, toParams).defaultPrevented) {
        return;
      }

      Permission
        .authorize(permissions, toParams)
        .then(function () {
          // If authorized, use call state.go without triggering the event.
          // Then trigger $stateChangeSuccess manually to resume the rest of the process
          // Note: This is a pseudo-hacky fix which should be fixed in future ui-router versions
          if (!$rootScope.$broadcast('$stateChangeStart', toState, toParams, fromState, fromParams).defaultPrevented) {
            $rootScope.$broadcast('$stateChangePermissionAccepted', toState, toParams);

            $state
              .go(toState.name, toParams, {notify: false})
              .then(function () {
                $rootScope
                  .$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
              });
          }
        })
        .catch(function () {
          if (!$rootScope.$broadcast('$stateChangeStart', toState, toParams, fromState, fromParams).defaultPrevented) {
            $rootScope.$broadcast('$stateChangePermissionDenied', toState, toParams);

            var redirectTo = permissions.redirectTo;

            if (angular.isFunction(redirectTo)) {
              redirectTo = redirectTo();

              $q.when(redirectTo).then(function (newState) {
                if (newState) {
                  $state.go(newState, toParams);
                }
              });

            } else {
              if (redirectTo) {
                $state.go(redirectTo, toParams);
              }
            }
          }
        });
    });
  }]);
}());
