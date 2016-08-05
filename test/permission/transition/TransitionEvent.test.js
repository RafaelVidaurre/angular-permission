describe('permission', function () {
  'use strict';

  describe('transition', function () {
    describe('service: PermTransitionEvents', function () {

      var PermTransitionEvents;

      beforeEach(function () {
        // Instantiate module
        module('permission');

        // Inject services into module
        inject(function ($injector) {
          PermTransitionEvents = $injector.get('PermTransitionEvents');
        });
      });

      it('should throw error when method "broadcastPermissionStartEvent" is not decorated', function () {
        expect(function () {
          PermTransitionEvents.broadcastPermissionStartEvent();
        }).toThrow(new Error('Method broadcastPermissionStartEvent in PermTransitionEvents interface must be implemented'));
      });

      it('should throw error when method "broadcastPermissionAcceptedEvent" is not decorated', function () {
        expect(function () {
          PermTransitionEvents.broadcastPermissionAcceptedEvent();
        }).toThrow(new Error('Method broadcastPermissionAcceptedEvent in PermTransitionEvents interface must be implemented'));
      });

      it('should throw error when method "broadcastPermissionDeniedEvent" is not decorated', function () {
        expect(function () {
          PermTransitionEvents.broadcastPermissionDeniedEvent();
        }).toThrow(new Error('Method broadcastPermissionDeniedEvent in PermTransitionEvents interface must be implemented'));
      });
    });
  });
});