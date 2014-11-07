(function () {
  'use strict';

  angular.module('permission', ['ui.router'])
    .run(['$rootScope', 'Permission', '$state', function ($rootScope, Permission, $state) {
      $rootScope.$on('$stateChangeStart',
      function (event, toState, toParams, fromState, fromParams) {
        // If there are permissions set then prevent default and attempt to authorize
        var permissions;
        if (toState.data && toState.data.permissions) {
          permissions = toState.data.permissions;
        } else if (toState.permissions) {
          /**
          * This way of defining permissions will be depracated in v1. Should use
          * `data` key instead
          */
          console.log('Deprecation Warning: permissions should be set inside the `data` key ');
          console.log('Setting permissions for a state outside `data` will be depracated in' +
            ' version 1');
          permissions = toState.permissions;
        }

        if (permissions) {
          event.preventDefault();

          Permission.authorize(permissions, toParams).then(function () {
            $rootScope.$broadcast('$stateChangePermissionAccepted', toState, toParams);

            // If authorized, use call state.go without triggering the event.
            // Then trigger $stateChangeSuccess manually to resume the rest of the process
            // Note: This is a pseudo-hacky fix which should be fixed in future ui-router versions
            $state.go(toState.name, toParams, {notify: false}).then(function() {
              $rootScope
                .$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
            });

          }, function () {
            $rootScope.$broadcast('$stateChangePermissionDenied', toState, toParams);

            // If not authorized, redirect to wherever the route has defined, if defined at all
            var redirectTo = permissions.redirectTo;
            if (redirectTo) {
              $state.go(redirectTo, {}, {notify: false}).then(function() {
                $rootScope
                  .$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
              });
            }
          });
        }
      });
    }]);
}());
