describe('permission', function () {
  'use strict';
  describe('authorization', function () {
    describe('service: PermAuthorization', function () {

      var PermPermissionStore;
      var PermRoleStore;
      var PermPermissionMap;
      var PermAuthorization;

      beforeEach(function () {
        module('permission');

        installPromiseMatchers(); // jshint ignore:line

        inject(function ($injector) {
          PermPermissionStore = $injector.get('PermPermissionStore');
          PermRoleStore = $injector.get('PermRoleStore');
          PermPermissionMap = $injector.get('PermPermissionMap');
          PermAuthorization = $injector.get('PermAuthorization');
        });
      });

      describe('method: authorizeByPermissionMap', function () {
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

        it('should resolve promise when "only" matches permissions', function () {
          // GIVEN
          var permissionMap = new PermPermissionMap({only: ['editPosts']});

          // WHEN
          var authorizationResult = PermAuthorization.authorizeByPermissionMap(permissionMap);

          // THEN
          expect(authorizationResult).toBePromise();
          expect(authorizationResult).toBeResolvedWith('editPosts');
        });

        it('should resolve promise when "only" matches roles', function () {
          // GIVEN
          var permissionMap = new PermPermissionMap({only: ['USER']});

          // WHEN
          var authorizationResult = PermAuthorization.authorizeByPermissionMap(permissionMap);

          // THEN
          expect(authorizationResult).toBePromise();
          expect(authorizationResult).toBeResolved();
        });

        it('should reject promise when "only" mismatches permissions', function () {
          // GIVEN
          var permissionMap = new PermPermissionMap({only: ['editUsers']});

          // WHEN
          var authorizationResult = PermAuthorization.authorizeByPermissionMap(permissionMap);

          // THEN
          expect(authorizationResult).toBePromise();
          expect(authorizationResult).toBeRejectedWith('editUsers');
        });

        it('should reject promise when "only" mismatches roles', function () {
          // GIVEN
          var permissionMap = new PermPermissionMap({only: ['ADMIN']});

          // WHEN
          var authorizationResult = PermAuthorization.authorizeByPermissionMap(permissionMap);

          // THEN
          expect(authorizationResult).toBePromise();
          expect(authorizationResult).toBeRejectedWith('editUsers');
        });

        it('should resolve promise when "except" mismatches permissions', function () {
          // GIVEN
          var permissionMap = new PermPermissionMap({except: ['editUsers']});

          // WHEN
          var authorizationResult = PermAuthorization.authorizeByPermissionMap(permissionMap);

          // THEN
          expect(authorizationResult).toBePromise();
          expect(authorizationResult).toBeResolved();
        });

        it('should resolve promise when "except" mismatches roles', function () {
          // GIVEN
          var permissionMap = new PermPermissionMap({except: ['ADMIN']});

          // WHEN
          var authorizationResult = PermAuthorization.authorizeByPermissionMap(permissionMap);

          // THEN
          expect(authorizationResult).toBePromise();
          expect(authorizationResult).toBeResolved();
        });

        it('should reject promise when "except" matches permissions', function () {
          // GIVEN
          var permissionMap = new PermPermissionMap({except: ['editPosts']});

          // WHEN
          var authorizationResult = PermAuthorization.authorizeByPermissionMap(permissionMap);

          // THEN
          expect(authorizationResult).toBePromise();
          expect(authorizationResult).toBeRejectedWith('editPosts');
        });

        it('should reject promise when "except" matches roles', function () {
          // GIVEN
          var permissionMap = new PermPermissionMap({except: ['USER']});

          // WHEN
          var authorizationResult = PermAuthorization.authorizeByPermissionMap(permissionMap);

          // THEN
          expect(authorizationResult).toBePromise();
          expect(authorizationResult).toBeRejected();
        });

        it('should reject promise when permission/role is undefined', function () {
          // GIVEN
          var permissionMap = new PermPermissionMap({only: ['SUPER_ADMIN']});

          // WHEN
          var authorizationResult = PermAuthorization.authorizeByPermissionMap(permissionMap);

          // THEN
          expect(authorizationResult).toBePromise();
          expect(authorizationResult).toBeRejected('SUPER_ADMIN');
        });
      });
    });
  });
});