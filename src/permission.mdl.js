(function () {
  'use strict';

  angular.module('permission', ['ui.router'])
    .run(function ($rootScope, Permission, $state) {
      $rootScope.$on('$stateChangeStart',
      function (event, toState, toParams, fromState, fromParams) {
        // If there are permissions set then prevent default and attempt to authorize
        if (toState.permissions) {
          event.preventDefault();

          Permission.authorize(toState.permissions).then(function () {
            // If authorized, use call state.go without triggering the event.
            // Then trigger $stateChangeSuccess manually to resume the rest of the process
            // Note: This is a pseudo-hacky fix which should be fixed in future ui-router versions
            $state.go(toState.name, toParams, {notify: false}).then(function() {
              $rootScope
                .$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
            });

          }, function () {
            // If not authorized, redirect to wherever the route has defined, if defined at all
            var redirectTo = toState.permissions.redirectTo;
            if (redirectTo) {
              $state.go(redirectTo, {}, {notify: false}).then(function() {
                $rootScope
                  .$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
              });
            }
          });
        }
      });
    });
}());
