describe('permission.ng', function () {
  'use strict';

  describe('transition', function () {
    describe('decorator: PermissionEvents', function () {

      var $rootScope;
      var PermTransitionEvents;
      var PermTransitionProperties;

      beforeEach(function () {
        module('permission.ng');

        inject(function ($injector) {
          $rootScope = $injector.get('$rootScope');
          PermTransitionEvents = $injector.get('PermTransitionEvents');
          PermTransitionProperties = $injector.get('PermTransitionProperties');
        });
      });

      describe('method: broadcastPermissionStartEvent', function () {
        it('should broadcast "$routeChangePermissionStart" event', function () {
          // GIVEN
          spyOn($rootScope, '$broadcast');

          // WHEN
          PermTransitionEvents.broadcastPermissionStartEvent();

          // THEN
          expect($rootScope.$broadcast).toHaveBeenCalledWith('$routeChangePermissionStart', jasmine.any(Object));
        });
      });

      describe('method: broadcastPermissionAcceptedEvent', function () {
        it('should broadcast "$routeChangePermissionAccepted" event', function () {
          // GIVEN
          spyOn($rootScope, '$broadcast');

          // WHEN
          PermTransitionEvents.broadcastPermissionAcceptedEvent();

          // THEN
          expect($rootScope.$broadcast).toHaveBeenCalledWith('$routeChangePermissionAccepted', jasmine.any(Object));
        });
      });

      describe('method: broadcastPermissionDeniedEvent', function () {
        it('should broadcast "$routeChangePermissionDenied" event', function () {
          // GIVEN
          spyOn($rootScope, '$broadcast');

          // WHEN
          PermTransitionEvents.broadcastPermissionDeniedEvent();

          // THEN
          expect($rootScope.$broadcast).toHaveBeenCalledWith('$routeChangePermissionDenied', jasmine.any(Object));
        });
      });

      describe('method: areEventsDefaultPrevented', function () {
        it('should check if none of events prevents authorization', function () {
          // GIVEN
          spyOn($rootScope, '$broadcast').and.callThrough();

          // WHEN
          var result = PermTransitionEvents.areEventsDefaultPrevented();

          // THEN
          expect($rootScope.$broadcast).toHaveBeenCalledWith('$routeChangePermissionStart', jasmine.any(Object));
          expect(result).toEqual(jasmine.any(Boolean));
        });
      });
    });
  });
});