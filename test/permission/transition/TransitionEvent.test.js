describe('permission', function () {
  'use strict';

  describe('transition', function () {
    describe('service: TransitionEvents', function () {

      var TransitionEvents;

      beforeEach(function () {
        // Instantiate module
        module('permission');

        // Inject services into module
        inject(function ($injector) {
          TransitionEvents = $injector.get('TransitionEvents');
        });
      });

      it('should throw error when method "broadcastPermissionStartEvent" is not decorated', function () {
        expect(function () {
          TransitionEvents.broadcastPermissionStartEvent();
        }).toThrow(new Error('Method broadcastPermissionStartEvent in TransitionEvents interface must be implemented'));
      });

      it('should throw error when method "broadcastPermissionAcceptedEvent" is not decorated', function () {
        expect(function () {
          TransitionEvents.broadcastPermissionAcceptedEvent();
        }).toThrow(new Error('Method broadcastPermissionAcceptedEvent in TransitionEvents interface must be implemented'));
      });

      it('should throw error when method "broadcastPermissionDeniedEvent" is not decorated', function () {
        expect(function () {
          TransitionEvents.broadcastPermissionDeniedEvent();
        }).toThrow(new Error('Method broadcastPermissionDeniedEvent in TransitionEvents interface must be implemented'));
      });
    });
  });
});