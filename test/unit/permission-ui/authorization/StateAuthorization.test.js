describe('permission.ui', function () {
  'use strict';
  describe('authorization', function () {

    describe('service: PermStateAuthorization', function () {

      var PermPermissionStore;
      var PermStatePermissionMap;
      var PermStateAuthorization;
      var PermRoleStore;

      beforeEach(function () {
        module('permission.ui');

        installPromiseMatchers(); // jshint ignore:line

        inject(function ($injector) {
          PermStateAuthorization = $injector.get('PermStateAuthorization');
          PermStatePermissionMap = $injector.get('PermStatePermissionMap');
          PermPermissionStore = $injector.get('PermPermissionStore');
          PermRoleStore = $injector.get('PermRoleStore');
        });
      });

      // Initialize permissions
      beforeEach(function () {
        PermPermissionStore.definePermission('editPosts', function () {
          return true;
        });

        PermPermissionStore.definePermission('editUsers', function () {
          return false;
        });

        PermRoleStore.defineRole('USER', ['editPosts']);
        PermRoleStore.defineRole('ADMIN', ['editUsers']);
      });

      describe('method: authorizeByPermissionMap', function () {
        it('should return resolved promise when "except" permissions are met', function () {
          // GIVEN
          var state = jasmine.createSpyObj('state', ['$$permissionState']);
          state.$$permissionState.and.callFake(function () {
            return {path: [{data: {permissions: {except: ['editUsers']}}}]};
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
          var state = jasmine.createSpyObj('state', ['$$permissionState']);
          state.$$permissionState.and.callFake(function () {
            return {path: [{data: {permissions: {except: ['editPosts']}}}]};
          });

          // WHEN
          var map = new PermStatePermissionMap(state);
          var authorizationResult = PermStateAuthorization.authorizeByPermissionMap(map);

          // THEN
          expect(authorizationResult).toBePromise();
          expect(authorizationResult).toBeRejectedWith('editPosts', jasmine.any(Object));
        });

        it('should return resolved promise when "only" permissions are met', function () {
          // GIVEN
          var state = jasmine.createSpyObj('state', ['$$permissionState']);
          state.$$permissionState.and.callFake(function () {
            return {path: [{data: {permissions: {only: ['editPosts']}}}]};
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
          var state = jasmine.createSpyObj('state', ['$$permissionState']);
          state.$$permissionState.and.callFake(function () {
            return {path: [{data: {permissions: {only: ['editUsers']}}}]};
          });

          // WHEN
          var map = new PermStatePermissionMap(state);
          var authorizationResult = PermStateAuthorization.authorizeByPermissionMap(map);

          // THEN
          expect(authorizationResult).toBePromise();
          expect(authorizationResult).toBeRejectedWith('editUsers', jasmine.any(Object));
        });

        it('should properly handle combination of "except" and "only" roles', function () {
          // GIVEN
          var state = jasmine.createSpyObj('state', ['$$permissionState']);
          state.$$permissionState.and.callFake(function () {
            return {path: [{data: {permissions: {only: ['ADMIN'], except: ['USER']}}}]};
          });

          // WHEN
          var map = new PermStatePermissionMap(state);
          var authorizationResult = PermStateAuthorization.authorizeByPermissionMap(map);

          // THEN
          expect(authorizationResult).toBePromise();
          expect(authorizationResult).toBeRejectedWith('editPosts', jasmine.any(Object));
        });
      });
    });
  });
});