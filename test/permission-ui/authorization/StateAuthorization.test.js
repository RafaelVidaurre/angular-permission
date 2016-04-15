describe('module: permission.ui', function () {
  'use strict';

  describe('authorization: StateAuthorization', function () {

    var $rootScope, $state, $stateProvider, PermissionStore, StatePermissionMap, StateAuthorization;

    beforeEach(function () {
      module('ui.router', function ($injector) {
        $stateProvider = $injector.get('$stateProvider');
      });

      module('permission.ui');

      inject(function ($injector) {
        $state = $injector.get('$state');
        $rootScope = $injector.get('$rootScope');
        StateAuthorization = $injector.get('StateAuthorization');
        PermissionStore = $injector.get('PermissionStore');
        StatePermissionMap = $injector.get('StatePermissionMap');
      });
    });

    // Initialize permissions
    beforeEach(function () {
      PermissionStore.definePermission('accepted', function () {
        return true;
      });

      PermissionStore.definePermission('denied', function () {
        return false;
      });
    });

    // Set default states and go home
    beforeEach(function () {
      $stateProvider
        .state('home', {})
        .state('accepted', {
          data: {
            permissions: {
              only: ['accepted']
            }
          }
        })
        .state('denied', {
          data: {
            permissions: {
              only: ['denied']
            }
          }
        });

      $state.go('home');
      $rootScope.$apply();
    });

    describe('event: $stateChangeStart', function () {
      it('should pass transition params and options passed', function () {
        // GIVEN
        spyOn($state, 'go').and.callThrough();

        $stateProvider.state('acceptedWithParamsAndOptions', {
          params: {
            param: undefined
          },
          data: {
            permissions: {
              only: ['accepted']
            }
          }
        });

        // WHEN
        $state.go('acceptedWithParamsAndOptions', {param: 'param'}, {relative: true});
        $rootScope.$apply();

        // THEN
        expect($state.go).toHaveBeenCalledWith('acceptedWithParamsAndOptions', {param: 'param'}, {
          location: true,
          inherit: true,
          relative: true,
          notify: false,
          reload: false,
          $retry: false
        });
      });
    });
  });
});