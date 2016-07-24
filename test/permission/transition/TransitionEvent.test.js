describe('permission', function () {
  'use strict';

  describe('transition', function () {
    describe('service: permTransitionEvents', function () {

      var permTransitionEvents;

      beforeEach(function () {
        // Instantiate module
        module('permission');

        // Inject services into module
        inject(function ($injector) {
          permTransitionEvents = $injector.get('permTransitionEvents');
        });
      });

      it('should throw error when method "broadcastPermissionStartEvent" is not decorated', function () {
        expect(function () {
          permTransitionEvents.broadcastPermissionStartEvent();
        }).toThrow(new Error('Method broadcastPermissionStartEvent in permTransitionEvents interface must be implemented'));
      });

      it('should throw error when method "broadcastPermissionAcceptedEvent" is not decorated', function () {
        expect(function () {
          permTransitionEvents.broadcastPermissionAcceptedEvent();
        }).toThrow(new Error('Method broadcastPermissionAcceptedEvent in permTransitionEvents interface must be implemented'));
      });

      it('should throw error when method "broadcastPermissionDeniedEvent" is not decorated', function () {
        expect(function () {
          permTransitionEvents.broadcastPermissionDeniedEvent();
        }).toThrow(new Error('Method broadcastPermissionDeniedEvent in permTransitionEvents interface must be implemented'));
      });
    });
  });
});