describe('module: permission.ui', function () {
  'use strict';

  describe('authorization: StateAuthorization', function () {

    var PermissionStore;
    var StatePermissionMap;
    var StateAuthorization;
    var TransitionProperties;

    beforeEach(function () {
      module('permission.ui');

      installPromiseMatchers(); // jshint ignore:line

      inject(function ($injector) {
        StateAuthorization = $injector.get('StateAuthorization');
        StatePermissionMap = $injector.get('StatePermissionMap');
        PermissionStore = $injector.get('PermissionStore');
        TransitionProperties = $injector.get('TransitionProperties');
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

    beforeEach(function(){
      TransitionProperties.toState = jasmine.createSpyObj('toState', ['$$state']);
    });

    describe('method: authorize', function () {
      it('should return resolved promise when "except" permissions are met', function () {
        // GIVEN
        TransitionProperties.toState.$$state.and.callFake(function () {
          return {path: [{data: {permissions: {except: ['denied']}}}]};
        });


        // WHEN
        var map = new StatePermissionMap();
        var authorizationResult = StateAuthorization.authorize(map);

        // THEN
        expect(authorizationResult).toBePromise();
        expect(authorizationResult).toBeResolved();
      });

      it('should return rejected promise when "except" permissions are not met', function () {
        // GIVEN
        TransitionProperties.toState.$$state.and.callFake(function () {
          return {path: [{data: {permissions: {except: ['accepted']}}}]};
        });

        // WHEN
        var map = new StatePermissionMap();
        var authorizationResult = StateAuthorization.authorize(map);

        // THEN
        expect(authorizationResult).toBePromise();
        expect(authorizationResult).toBeRejected();
      });

      it('should return resolved promise when "only" permissions are met', function () {
        // GIVEN
        TransitionProperties.toState.$$state.and.callFake(function () {
          return {path: [{data: {permissions: {only: ['accepted']}}}]};
        });

        // WHEN
        var map = new StatePermissionMap();
        var authorizationResult = StateAuthorization.authorize(map);

        // THEN
        expect(authorizationResult).toBePromise();
        expect(authorizationResult).toBeResolved();
      });

      it('should return rejected promise when "only" permissions are not met', function () {
        // GIVEN
        TransitionProperties.toState.$$state.and.callFake(function () {
          return {path: [{data: {permissions: {only: ['denied']}}}]};
        });

        // WHEN
        var map = new StatePermissionMap();
        var authorizationResult = StateAuthorization.authorize(map);

        // THEN
        expect(authorizationResult).toBePromise();
        expect(authorizationResult).toBeRejected();
      });
    });
  });
});