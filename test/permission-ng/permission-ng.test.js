describe('permission.ng', function () {
  'use strict';
  describe('module', function () {

    var $rootScope;
    var $location;
    var $routeProvider;
    var permPermissionStore;
    var permTransitionEvents;
    var permTransitionProperties;
    var permAuthorization;

    beforeEach(function () {
      module('ngRoute', function ($injector) {
        $routeProvider = $injector.get('$routeProvider');
      });

      module('permission.ng');

      inject(function ($injector) {
        $location = $injector.get('$location');
        $rootScope = $injector.get('$rootScope');
        permPermissionStore = $injector.get('permPermissionStore');
        permTransitionEvents = $injector.get('permTransitionEvents');
        permTransitionProperties = $injector.get('permTransitionProperties');
        permAuthorization = $injector.get('permAuthorization');
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
          expect(permTransitionProperties.next).toBeDefined();
          expect(permTransitionProperties.current).toBeDefined();
        });

        it('should not start authorizing when $routeChangePermissionStart was prevented', function () {
          // GIVEN
          $rootScope.$on('$routeChangePermissionStart', function (event) {
            event.preventDefault();
          });

          spyOn(permTransitionEvents, 'broadcastPermissionStartEvent');

          // WHEN
          $location.path('/accepted');
          $rootScope.$digest();

          // THEN
          expect($location.path()).toBe('/accepted');

          expect(permTransitionEvents.broadcastPermissionStartEvent).not.toHaveBeenCalled();
        });

        it('should handle unauthorized state access', function () {
          // GIVEN
          spyOn(permTransitionEvents, 'broadcastPermissionDeniedEvent');
          spyOn(permAuthorization, 'authorize').and.callThrough();

          // WHEN
          $location.path('/denied');
          $rootScope.$digest();

          // THEN
          expect($location.path()).toBe('/redirected');
          expect(permAuthorization.authorize).toHaveBeenCalled();
          expect(permTransitionEvents.broadcastPermissionDeniedEvent).toHaveBeenCalled();
        });

        it('should handle authorized state access', function () {
          // GIVEN
          spyOn(permTransitionEvents, 'broadcastPermissionAcceptedEvent');
          spyOn(permAuthorization, 'authorize').and.callThrough();

          // WHEN
          $location.path('/accepted');
          $rootScope.$digest();

          // THEN
          expect(permAuthorization.authorize).toHaveBeenCalled();
          expect(permTransitionEvents.broadcastPermissionAcceptedEvent).toHaveBeenCalled();
        });
      });
    });
  });
});