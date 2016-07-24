describe('permission.ui', function () {
  'use strict';
  describe('authorization', function () {

    describe('service: permStateAuthorization', function () {

      var permPermissionStore;
      var permStatePermissionMap;
      var permStateAuthorization;

      beforeEach(function () {
        module('permission.ui');

        installPromiseMatchers(); // jshint ignore:line

        inject(function ($injector) {
          permStateAuthorization = $injector.get('permStateAuthorization');
          permStatePermissionMap = $injector.get('permStatePermissionMap');
          permPermissionStore = $injector.get('permPermissionStore');
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

      describe('method: authorize', function () {
        it('should return resolved promise when "except" permissions are met', function () {
          // GIVEN
          var state = jasmine.createSpyObj('state', ['$$state']);
          state.$$state.and.callFake(function () {
            return {path: [{data: {permissions: {except: ['denied']}}}]};
          });


          // WHEN
          var map = new permStatePermissionMap(state);
          var authorizationResult = permStateAuthorization.authorize(map);

          // THEN
          expect(authorizationResult).toBePromise();
          expect(authorizationResult).toBeResolved();
        });

        it('should return rejected promise when "except" permissions are not met', function () {
          // GIVEN
          var state = jasmine.createSpyObj('state', ['$$state']);
          state.$$state.and.callFake(function () {
            return {path: [{data: {permissions: {except: ['accepted']}}}]};
          });

          // WHEN
          var map = new permStatePermissionMap(state);
          var authorizationResult = permStateAuthorization.authorize(map);

          // THEN
          expect(authorizationResult).toBePromise();
          expect(authorizationResult).toBeRejected();
        });

        it('should return resolved promise when "only" permissions are met', function () {
          // GIVEN
          var state = jasmine.createSpyObj('state', ['$$state']);
          state.$$state.and.callFake(function () {
            return {path: [{data: {permissions: {only: ['accepted']}}}]};
          });

          // WHEN
          var map = new permStatePermissionMap(state);
          var authorizationResult = permStateAuthorization.authorize(map);

          // THEN
          expect(authorizationResult).toBePromise();
          expect(authorizationResult).toBeResolved();
        });

        it('should return rejected promise when "only" permissions are not met', function () {
          // GIVEN
          var state = jasmine.createSpyObj('state', ['$$state']);
          state.$$state.and.callFake(function () {
            return {path: [{data: {permissions: {only: ['denied']}}}]};
          });

          // WHEN
          var map = new permStatePermissionMap(state);
          var authorizationResult = permStateAuthorization.authorize(map);

          // THEN
          expect(authorizationResult).toBePromise();
          expect(authorizationResult).toBeRejected();
        });
      });
    });
  });
});