describe('permission.ng', function () {
  'use strict';
  describe('module', function () {

    var $rootScope;
    var $location;
    var $routeProvider;
    var PermPermissionStore;
    var PermTransitionEvents;
    var PermTransitionProperties;
    var PermAuthorization;

    beforeEach(function () {
      module('ngRoute', function ($injector) {
        $routeProvider = $injector.get('$routeProvider');
      });

      module('permission.ng');

      inject(function ($injector) {
        $location = $injector.get('$location');
        $rootScope = $injector.get('$rootScope');
        PermPermissionStore = $injector.get('PermPermissionStore');
        PermTransitionEvents = $injector.get('PermTransitionEvents');
        PermTransitionProperties = $injector.get('PermTransitionProperties');
        PermAuthorization = $injector.get('PermAuthorization');
      });
    });

    // Initialize permissions
    beforeEach(function () {
      PermPermissionStore.definePermission('accepted', function () {
        return true;
      });

      PermPermissionStore.definePermission('denied', function () {
        return false;
      });
    });

    // Set default states and go home
    beforeEach(function () {
      $routeProvider
        .when('/', {})
        .when('/accepted', {
          data: {
            permissions: {
              only: ['accepted']
            }
          }
        })
        .when('/denied', {
          data: {
            permissions: {
              only: ['denied'],
              redirectTo: 'redirected'
            }
          }
        })
        .when('/redirected', {});

      $location.path('/');
      $rootScope.$digest();
    });

    describe('method: run', function () {
      describe('event: $routeChangeStart', function () {
        it('should set transitionProperties when authorization is not finished', function () {
          // GIVEN
          // WHEN
          $location.path('/accepted');
          $rootScope.$digest();

          // THEN
          expect(PermTransitionProperties.next).toBeDefined();
          expect(PermTransitionProperties.current).toBeDefined();
        });

        it('should not start authorizing when $routeChangePermissionStart was prevented', function () {
          // GIVEN
          $rootScope.$on('$routeChangePermissionStart', function (event) {
            event.preventDefault();
          });

          spyOn(PermTransitionEvents, 'broadcastPermissionStartEvent');

          // WHEN
          $location.path('/accepted');
          $rootScope.$digest();

          // THEN
          expect($location.path()).toBe('/accepted');

          expect(PermTransitionEvents.broadcastPermissionStartEvent).not.toHaveBeenCalled();
        });

        it('should handle unauthorized state access', function () {
          // GIVEN
          spyOn(PermTransitionEvents, 'broadcastPermissionDeniedEvent');
          spyOn(PermAuthorization, 'authorize').and.callThrough();

          // WHEN
          $location.path('/denied');
          $rootScope.$digest();

          // THEN
          expect($location.path()).toBe('/redirected');
          expect(PermAuthorization.authorize).toHaveBeenCalled();
          expect(PermTransitionEvents.broadcastPermissionDeniedEvent).toHaveBeenCalled();
        });

        it('should handle authorized state access', function () {
          // GIVEN
          spyOn(PermTransitionEvents, 'broadcastPermissionAcceptedEvent');
          spyOn(PermAuthorization, 'authorize').and.callThrough();

          // WHEN
          $location.path('/accepted');
          $rootScope.$digest();

          // THEN
          expect(PermAuthorization.authorize).toHaveBeenCalled();
          expect(PermTransitionEvents.broadcastPermissionAcceptedEvent).toHaveBeenCalled();
        });
      });
    });
  });
});