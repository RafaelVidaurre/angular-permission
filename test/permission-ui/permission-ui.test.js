describe('permission.ui', function () {
  'use strict';
  describe('module', function () {

    var $rootScope;
    var $state;
    var $stateProvider;
    var PermissionStore;
    var TransitionEvents;
    var TransitionProperties;
    var StateAuthorization;

    beforeEach(function () {
      module('ui.router', function ($injector) {
        $stateProvider = $injector.get('$stateProvider');
      });

      module('permission.ui');

      inject(function ($injector) {
        $state = $injector.get('$state');
        $rootScope = $injector.get('$rootScope');
        PermissionStore = $injector.get('PermissionStore');
        TransitionEvents = $injector.get('TransitionEvents');
        TransitionProperties = $injector.get('TransitionProperties');
        StateAuthorization = $injector.get('StateAuthorization');
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
          expect(TransitionProperties.toState).toBeDefined();
          expect(TransitionProperties.toParams).toBeDefined();
          expect(TransitionProperties.fromState).toBeDefined();
          expect(TransitionProperties.fromParams).toBeDefined();
          expect(TransitionProperties.options).toBeDefined();
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
          expect(TransitionProperties.toState.$$isAuthorizationFinished).toBeFalsy();
        });

        it('should not start authorizing when $stateChangePermissionStart was prevented', function () {
          // GIVEN
          $rootScope.$on('$stateChangePermissionStart', function (event) {
            event.preventDefault();
          });

          spyOn(TransitionEvents, 'broadcastPermissionStartEvent');

          // WHEN
          $state.go('accepted');
          $rootScope.$digest();

          // THEN
          expect($state.current.name).toBe('accepted');

          expect(TransitionEvents.broadcastPermissionStartEvent).not.toHaveBeenCalled();
        });

        it('should not start authorizing when $stateChangeStart has been prevented', function () {
          // GIVEN
          $rootScope.$on('$stateChangeStart', function (event) {
            event.preventDefault();
          });

          spyOn(TransitionEvents, 'broadcastPermissionStartEvent');

          // WHEN
          $state.go('accepted');
          $rootScope.$digest();

          $state.go('denied');
          $rootScope.$digest();

          // THEN
          expect($state.current.name).toBe('home');
          expect(TransitionEvents.broadcastPermissionStartEvent).not.toHaveBeenCalled();
        });

        it('should handle unauthorized state access', function () {
          // GIVEN
          spyOn(TransitionEvents, 'broadcastPermissionDeniedEvent');
          spyOn(StateAuthorization, 'authorize').and.callThrough();

          // WHEN
          $state.go('denied');
          $rootScope.$digest();

          // THEN
          expect($state.current.name).toBe('redirected');
          expect(StateAuthorization.authorize).toHaveBeenCalled();
          expect(TransitionEvents.broadcastPermissionDeniedEvent).toHaveBeenCalled();
        });

        it('should handle authorized state access', function () {
          // GIVEN
          spyOn(TransitionEvents, 'broadcastPermissionAcceptedEvent');
          spyOn(StateAuthorization, 'authorize').and.callThrough();

          // WHEN
          $state.go('accepted');
          $rootScope.$digest();

          // THEN
          expect($state.current.name).toBe('accepted');
          expect(StateAuthorization.authorize).toHaveBeenCalled();
          expect(TransitionEvents.broadcastPermissionAcceptedEvent).toHaveBeenCalled();
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
