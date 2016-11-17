describe('permission.ui', function () {
  'use strict';

  describe('transition', function () {
    describe('decorator: PermissionEvents', function () {

      var $rootScope;
      var PermTransitionEvents;
      var PermTransitionProperties;

      beforeEach(function () {
        module('permission.ui');

        inject(function ($injector) {
          $rootScope = $injector.get('$rootScope');
          PermTransitionEvents = $injector.get('PermTransitionEvents');
          PermTransitionProperties = $injector.get('PermTransitionProperties');
        });
      });

      describe('method: broadcastPermissionStartEvent', function () {
        it('should broadcast "$stateChangePermissionStart" event', function () {
          // GIVEN
          spyOn($rootScope, '$broadcast');

          // WHEN
          PermTransitionEvents.broadcastPermissionStartEvent();

          // THEN
          expect($rootScope.$broadcast).toHaveBeenCalledWith('$stateChangePermissionStart',
            jasmine.any(Object), jasmine.any(Object), jasmine.any(Object)
          );
        });
      });

      describe('method: broadcastPermissionAcceptedEvent', function () {
        it('should broadcast "$stateChangePermissionAccepted" event', function () {
          // GIVEN
          spyOn($rootScope, '$broadcast');

          // WHEN
          PermTransitionEvents.broadcastPermissionAcceptedEvent();

          // THEN
          expect($rootScope.$broadcast).toHaveBeenCalledWith('$stateChangePermissionAccepted',
            jasmine.any(Object), jasmine.any(Object), jasmine.any(Object)
          );
        });
      });

      describe('method: broadcastPermissionDeniedEvent', function () {
        it('should broadcast "$stateChangePermissionDenied" event', function () {
          // GIVEN
          spyOn($rootScope, '$broadcast');

          // WHEN
          PermTransitionEvents.broadcastPermissionDeniedEvent();

          // THEN
          expect($rootScope.$broadcast).toHaveBeenCalledWith('$stateChangePermissionDenied',
            jasmine.any(Object), jasmine.any(Object), jasmine.any(Object)
          );
        });
      });

      describe('method: broadcastStateChangeSuccessEvent', function () {
        it('should broadcast "$stateChangeSuccess" event', function () {
          // GIVEN
          spyOn($rootScope, '$broadcast');

          // WHEN
          PermTransitionEvents.broadcastStateChangeSuccessEvent();

          // THEN
          expect($rootScope.$broadcast).toHaveBeenCalledWith('$stateChangeSuccess',
            jasmine.any(Object), jasmine.any(Object), jasmine.any(Object), jasmine.any(Object)
          );
        });
      });

      describe('method: areEventsDefaultPrevented', function () {
        it('should check if none of events prevents authorization', function () {
          // GIVEN
          spyOn($rootScope, '$broadcast').and.callThrough();
          PermTransitionProperties.toState = {
            $$isAuthorizationFinished: true
          };

          // WHEN
          var result = PermTransitionEvents.areEventsDefaultPrevented();

          // THEN
          expect($rootScope.$broadcast).toHaveBeenCalledWith('$stateChangePermissionStart',
            jasmine.any(Object), jasmine.any(Object), jasmine.any(Object)
          );

          expect($rootScope.$broadcast).toHaveBeenCalledWith('$stateChangeStart',
            jasmine.any(Object), jasmine.any(Object), jasmine.any(Object), jasmine.any(Object), jasmine.any(Object)
          );

          expect(result).toEqual(jasmine.any(Boolean));
        });
      });
    });
  });
});