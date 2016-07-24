describe('permission.ui', function () {
  'use strict';
  describe('module', function () {

    var $rootScope;
    var $state;
    var $stateProvider;
    var permPermissionStore;
    var permTransitionEvents;
    var permTransitionProperties;
    var permStateAuthorization;

    beforeEach(function () {
      module('ui.router', function ($injector) {
        $stateProvider = $injector.get('$stateProvider');
      });

      module('permission.ui');

      inject(function ($injector) {
        $state = $injector.get('$state');
        $rootScope = $injector.get('$rootScope');
        permPermissionStore = $injector.get('permPermissionStore');
        permTransitionEvents = $injector.get('permTransitionEvents');
        permTransitionProperties = $injector.get('permTransitionProperties');
        permStateAuthorization = $injector.get('permStateAuthorization');
      });
    });

    // Initialize permissions
    beforeEach(function () {
      permPermissionStore.definePermission('accepted', function () {
        return true;
      });

      permPermissionStore.definePermission('denied', function () {
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
              only: ['denied'],
              redirectTo: 'redirected'
            }
          }
        })
        .state('redirected', {});

      $state.go('home');
      $rootScope.$digest();
    });


    describe('method: config', function () {
      it('should decorate $state object', function () {
        // GIVEN
        // WHEN
        // THEN
        expect($state.current.$$state).toBeDefined();
        expect($state.current.$$isAuthorizationFinished).toBeDefined();
      });
    });

    describe('method: run', function () {
      describe('event: $stateChangeStart', function () {
        it('should set transitionProperties when authorization is not finished', function () {
          // GIVEN
          // WHEN
          $state.go('accepted');
          $rootScope.$digest();

          // THEN
          expect(permTransitionProperties.toState).toBeDefined();
          expect(permTransitionProperties.toParams).toBeDefined();
          expect(permTransitionProperties.fromState).toBeDefined();
          expect(permTransitionProperties.fromParams).toBeDefined();
          expect(permTransitionProperties.options).toBeDefined();
        });

        it('should not set $$isAuthorizationFinished flag when authorization is not finished', function () {
          // GIVEN
          $rootScope.$on('$stateChangePermissionStart', function (event) {
            event.preventDefault();
          });

          // WHEN
          $state.go('accepted');
          $rootScope.$digest();

          // THEN
          expect(permTransitionProperties.toState.$$isAuthorizationFinished).toBeFalsy();
        });

        it('should not start authorizing when $stateChangePermissionStart was prevented', function () {
          // GIVEN
          $rootScope.$on('$stateChangePermissionStart', function (event) {
            event.preventDefault();
          });

          spyOn(permTransitionEvents, 'broadcastPermissionStartEvent');

          // WHEN
          $state.go('accepted');
          $rootScope.$digest();

          // THEN
          expect($state.current.name).toBe('accepted');

          expect(permTransitionEvents.broadcastPermissionStartEvent).not.toHaveBeenCalled();
        });

        it('should not start authorizing when $stateChangeStart has been prevented', function () {
          // GIVEN
          $rootScope.$on('$stateChangeStart', function (event) {
            event.preventDefault();
          });

          spyOn(permTransitionEvents, 'broadcastPermissionStartEvent');

          // WHEN
          $state.go('accepted');
          $rootScope.$digest();

          $state.go('denied');
          $rootScope.$digest();

          // THEN
          expect($state.current.name).toBe('home');
          expect(permTransitionEvents.broadcastPermissionStartEvent).not.toHaveBeenCalled();
        });

        it('should handle unauthorized state access', function () {
          // GIVEN
          spyOn(permTransitionEvents, 'broadcastPermissionDeniedEvent');
          spyOn(permStateAuthorization, 'authorize').and.callThrough();

          // WHEN
          $state.go('denied');
          $rootScope.$digest();

          // THEN
          expect($state.current.name).toBe('redirected');
          expect(permStateAuthorization.authorize).toHaveBeenCalled();
          expect(permTransitionEvents.broadcastPermissionDeniedEvent).toHaveBeenCalled();
        });

        it('should handle authorized state access', function () {
          // GIVEN
          spyOn(permTransitionEvents, 'broadcastPermissionAcceptedEvent');
          spyOn(permStateAuthorization, 'authorize').and.callThrough();

          // WHEN
          $state.go('accepted');
          $rootScope.$digest();

          // THEN
          expect($state.current.name).toBe('accepted');
          expect(permStateAuthorization.authorize).toHaveBeenCalled();
          expect(permTransitionEvents.broadcastPermissionAcceptedEvent).toHaveBeenCalled();
        });

        it('should honor params and options passed to "transitionTo" or "go" function', function () {
          // GIVEN
          spyOn($state, 'go').and.callThrough();

          $stateProvider
            .state('acceptedWithParamsAndOptions', {
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
            location: true, inherit: true, relative: true, notify: false, reload: false, $retry: false
          });
        });
      });
    });
  });
});
