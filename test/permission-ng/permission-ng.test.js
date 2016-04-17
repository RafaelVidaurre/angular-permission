describe('permission.ng', function () {
  'use strict';
  describe('module', function () {

    var $rootScope;
    var $location;
    var $routeProvider;
    var PermissionStore;
    var TransitionEvents;
    var TransitionProperties;
    var Authorization;

    beforeEach(function () {
      module('ngRoute', function ($injector) {
        $routeProvider = $injector.get('$routeProvider');
      });

      module('permission.ng');

      inject(function ($injector) {
        $location = $injector.get('$location');
        $rootScope = $injector.get('$rootScope');
        PermissionStore = $injector.get('PermissionStore');
        TransitionEvents = $injector.get('TransitionEvents');
        TransitionProperties = $injector.get('TransitionProperties');
        Authorization = $injector.get('Authorization');
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
      $routeProvider
        .when('/', {})
        .when('/accepted', {
          permissions: {
            only: ['accepted']
          }
        })
        .when('/denied', {
          permissions: {
            only: ['denied'],
            redirectTo: 'redirected'
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
          expect(TransitionProperties.next).toBeDefined();
          expect(TransitionProperties.current).toBeDefined();
        });

        it('should not start authorizing when $routeChangePermissionStart was prevented', function () {
          // GIVEN
          $rootScope.$on('$routeChangePermissionStart', function (event) {
            event.preventDefault();
          });

          spyOn(TransitionEvents, 'broadcastPermissionStartEvent');

          // WHEN
          $location.path('/accepted');
          $rootScope.$digest();

          // THEN
          expect($location.path()).toBe('/accepted');

          expect(TransitionEvents.broadcastPermissionStartEvent).not.toHaveBeenCalled();
        });

        it('should handle unauthorized state access', function () {
          // GIVEN
          spyOn(TransitionEvents, 'broadcastPermissionDeniedEvent');
          spyOn(Authorization, 'authorize').and.callThrough();

          // WHEN
          $location.path('/denied');
          $rootScope.$digest();

          // THEN
          expect($location.path()).toBe('/redirected');
          expect(Authorization.authorize).toHaveBeenCalled();
          expect(TransitionEvents.broadcastPermissionDeniedEvent).toHaveBeenCalled();
        });

        it('should handle authorized state access', function () {
          // GIVEN
          spyOn(TransitionEvents, 'broadcastPermissionAcceptedEvent');
          spyOn(Authorization, 'authorize').and.callThrough();

          // WHEN
          $location.path('/accepted');
          $rootScope.$digest();

          // THEN
          expect($location.path()).toBe('/accepted');
          expect(Authorization.authorize).toHaveBeenCalled();
          expect(TransitionEvents.broadcastPermissionAcceptedEvent).toHaveBeenCalled();
        });
      });
    });
  });
});