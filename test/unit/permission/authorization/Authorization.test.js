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
          PermPermissionStore.definePermission('USER', function () {
            return true;
          });

          PermPermissionStore.definePermission('ADMIN', function () {
            return false;
          });

          PermRoleStore.defineRole('ACCOUNTANT', ['USER']);
          PermRoleStore.defineRole('ADMIN_ACCOUNTANT', ['ADMIN']);
        });

        it('should resolve promise when "only" matches permissions', function () {
          // GIVEN
          var permissionMap = new PermPermissionMap({only: ['USER']});

          // WHEN
          var promise = PermAuthorization.authorizeByPermissionMap(permissionMap);

          // THEN
          expect(promise).toBeResolved();
        });

        it('should resolve promise when "only" matches roles', function () {
          // GIVEN
          var permissionMap = new PermPermissionMap({only: ['ACCOUNTANT']});

          // WHEN
          var promise = PermAuthorization.authorizeByPermissionMap(permissionMap);

          // THEN
          expect(promise).toBeResolved();
        });

        it('should reject promise when "only" mismatches permissions', function () {
          // GIVEN
          var permissionMap = new PermPermissionMap({only: ['ADMIN']});

          // WHEN
          var promise = PermAuthorization.authorizeByPermissionMap(permissionMap);

          // THEN
          expect(promise).toBeRejected();
        });

        it('should reject promise when "only" mismatches roles', function () {
          // GIVEN
          var permissionMap = new PermPermissionMap({only: ['ADMIN_ACCOUNTANT']});

          // WHEN
          var promise = PermAuthorization.authorizeByPermissionMap(permissionMap);

          // THEN
          expect(promise).toBeRejected();
        });

        it('should resolve promise when "except" mismatches permissions', function () {
          // GIVEN
          var permissionMap = new PermPermissionMap({except: ['ADMIN']});

          // WHEN
          var promise = PermAuthorization.authorizeByPermissionMap(permissionMap);

          // THEN
          expect(promise).toBeResolved();
        });

        it('should resolve promise when "except" mismatches roles', function () {
          // GIVEN
          var permissionMap = new PermPermissionMap({except: ['ADMIN_ACCOUNTANT']});

          // WHEN
          var promise = PermAuthorization.authorizeByPermissionMap(permissionMap);

          // THEN
          expect(promise).toBeResolved();
        });

        it('should reject promise when "except" matches permissions', function () {
          // GIVEN
          var permissionMap = new PermPermissionMap({except: ['USER']});

          // WHEN
          var promise = PermAuthorization.authorizeByPermissionMap(permissionMap);

          // THEN
          expect(promise).toBeRejected();
        });

        it('should reject promise when "except" matches roles', function () {
          // GIVEN
          var permissionMap = new PermPermissionMap({except: ['ACCOUNTANT']});

          // WHEN
          var promise = PermAuthorization.authorizeByPermissionMap(permissionMap);

          // THEN
          expect(promise).toBeRejected();
        });

        it('should reject promise when permission/role is undefined', function () {
          // GIVEN
          var permissionMap = new PermPermissionMap({only: ['SUPER_ADMIN']});

          // WHEN
          var promise = PermAuthorization.authorizeByPermissionMap(permissionMap);

          // THEN
          expect(promise).toBeRejected();
        });
      });
    });
  });
});