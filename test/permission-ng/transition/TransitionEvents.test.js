describe('permission.ng', function () {
  'use strict';

  describe('transition', function () {
    describe('decorator: PermissionEvents', function () {

      var $rootScope;
      var permTransitionEvents;
      var permTransitionProperties;

      beforeEach(function () {
        module('permission.ng');

        inject(function ($injector) {
          $rootScope = $injector.get('$rootScope');
          permTransitionEvents = $injector.get('permTransitionEvents');
          permTransitionProperties = $injector.get('permTransitionProperties');
        });
      });

      describe('method: broadcastPermissionStartEvent', function () {
        it('should broadcast "$routeChangePermissionStart" event', function () {
          // GIVEN
          spyOn($rootScope, '$broadcast');

          // WHEN
          permTransitionEvents.broadcastPermissionStartEvent();

          // THEN
          expect($rootScope.$broadcast).toHaveBeenCalledWith('$routeChangePermissionStart', jasmine.any(Object));
        });
      });

      describe('method: broadcastPermissionAcceptedEvent', function () {
        it('should broadcast "$routeChangePermissionAccepted" event', function () {
          // GIVEN
          spyOn($rootScope, '$broadcast');

          // WHEN
          permTransitionEvents.broadcastPermissionAcceptedEvent();

          // THEN
          expect($rootScope.$broadcast).toHaveBeenCalledWith('$routeChangePermissionAccepted', jasmine.any(Object));
        });
      });

      describe('method: broadcastPermissionDeniedEvent', function () {
        it('should broadcast "$routeChangePermissionDenied" event', function () {
          // GIVEN
          spyOn($rootScope, '$broadcast');

          // WHEN
          permTransitionEvents.broadcastPermissionDeniedEvent();

          // THEN
          expect($rootScope.$broadcast).toHaveBeenCalledWith('$routeChangePermissionDenied', jasmine.any(Object));
        });
      });

      describe('method: areEventsDefaultPrevented', function () {
        it('should check if none of events prevents authorization', function () {
          // GIVEN
          spyOn($rootScope, '$broadcast').and.callThrough();

          // WHEN
          var result = permTransitionEvents.areEventsDefaultPrevented();

          // THEN
          expect($rootScope.$broadcast).toHaveBeenCalledWith('$routeChangePermissionStart', jasmine.any(Object));
          expect(result).toEqual(jasmine.any(Boolean));
        });
      });
    });
  });
});