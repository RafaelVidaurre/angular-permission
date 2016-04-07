describe('service: StateAuthorization', function () {
  'use strict';

  var $rootScope, $state, $stateProvider, PermissionStore, StatePermissionMap, StateAuthorization;

  beforeEach(function () {
    module('ui.router', function ($injector) {
      $stateProvider = $injector.get('$stateProvider');
    });

    module('permission');

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

  var changePermissionAcceptedHasBeenCalled, changePermissionDeniedHasBeenCalled;

  // Bind event listeners
  beforeEach(function () {
    changePermissionAcceptedHasBeenCalled = false;
    changePermissionDeniedHasBeenCalled = false;

    $rootScope.$on('$stateChangePermissionAccepted', function () {
      changePermissionAcceptedHasBeenCalled = true;
    });

    $rootScope.$on('$stateChangePermissionDenied', function () {
      changePermissionDeniedHasBeenCalled = true;
    });
  });

  describe('event: $stateChangeStart', function () {
    it('should build PermissionMap including parent states permissions', function () {
      // GIVEN
      $stateProvider
        .state('compensated', {
          data: {
            permissions: {
              only: ['accepted'],
              except: ['denied']
            }
          }
        })
        .state('compensated.child', {
          data: {
            permissions: {
              only: ['acceptedChild'],
              except: ['deniedChild']
            }
          }
        });

      PermissionStore.definePermission('acceptedChild', function () {
        return true;
      });

      PermissionStore.definePermission('deniedChild', function () {
        return false;
      });

      spyOn(StateAuthorization, 'authorize').and.callThrough();

      // WHEN
      $state.go('compensated.child');
      $rootScope.$apply();

      // THEN
      expect(StateAuthorization.authorize).toHaveBeenCalledWith(new StatePermissionMap({
        only: [['acceptedChild'], ['accepted']],
        except: [['deniedChild'], ['denied']],
        redirectTo: undefined
      }));
    });

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