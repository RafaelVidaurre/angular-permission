describe('permission.ui', function () {
  'use strict';
  describe('authorization', function () {

    describe('service: PermStateAuthorization', function () {

      var PermPermissionStore;
      var PermStatePermissionMap;
      var PermStateAuthorization;

      beforeEach(function () {
        module('permission.ui');

        installPromiseMatchers(); // jshint ignore:line

        inject(function ($injector) {
          PermStateAuthorization = $injector.get('PermStateAuthorization');
          PermStatePermissionMap = $injector.get('PermStatePermissionMap');
          PermPermissionStore = $injector.get('PermPermissionStore');
        });
      });

      // Initialize permissions
      beforeEach(function () {
        PermPermissionStore.definePermission('accepted', function () {
          return true;
        });

        PermPermissionStore.definePermission('denied', function () {
          return false;
        });
      });

      describe('method: authorizeByPermissionMap', function () {
        it('should return resolved promise when "except" permissions are met', function () {
          // GIVEN
          var state = jasmine.createSpyObj('state', ['$$state']);
          state.$$state.and.callFake(function () {
            return {path: [{data: {permissions: {except: ['denied']}}}]};
          });


          // WHEN
          var map = new PermStatePermissionMap(state);
          var authorizationResult = PermStateAuthorization.authorizeByPermissionMap(map);

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
          var map = new PermStatePermissionMap(state);
          var authorizationResult = PermStateAuthorization.authorizeByPermissionMap(map);

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
          var map = new PermStatePermissionMap(state);
          var authorizationResult = PermStateAuthorization.authorizeByPermissionMap(map);

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
          var map = new PermStatePermissionMap(state);
          var authorizationResult = PermStateAuthorization.authorizeByPermissionMap(map);

          // THEN
          expect(authorizationResult).toBePromise();
          expect(authorizationResult).toBeRejected();
        });
      });
    });
  });
});