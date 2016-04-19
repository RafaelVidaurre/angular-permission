describe('permission.ui', function () {
  'use strict';
  describe('authorization', function () {

    describe('service: StateAuthorization', function () {

      var PermissionStore;
      var StatePermissionMap;
      var StateAuthorization;

      beforeEach(function () {
        module('permission.ui');

        installPromiseMatchers(); // jshint ignore:line

        inject(function ($injector) {
          StateAuthorization = $injector.get('StateAuthorization');
          StatePermissionMap = $injector.get('StatePermissionMap');
          PermissionStore = $injector.get('PermissionStore');
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

      describe('method: authorize', function () {
        it('should return resolved promise when "except" permissions are met', function () {
          // GIVEN
          var state = jasmine.createSpyObj('state', ['$$state']);
          state.$$state.and.callFake(function () {
            return {path: [{data: {permissions: {except: ['denied']}}}]};
          });


          // WHEN
          var map = new StatePermissionMap(state);
          var authorizationResult = StateAuthorization.authorize(map);

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
          var map = new StatePermissionMap(state);
          var authorizationResult = StateAuthorization.authorize(map);

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
          var map = new StatePermissionMap(state);
          var authorizationResult = StateAuthorization.authorize(map);

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
          var map = new StatePermissionMap(state);
          var authorizationResult = StateAuthorization.authorize(map);

          // THEN
          expect(authorizationResult).toBePromise();
          expect(authorizationResult).toBeRejected();
        });
      });
    });
  });
});