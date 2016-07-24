describe('permission', function () {
  'use strict';
  describe('authorization', function () {
    describe('service: permAuthorization', function () {

      var permPermissionStore;
      var permRoleStore;
      var permPermissionMap;
      var permAuthorization;

      beforeEach(function () {
        module('permission');

        installPromiseMatchers(); // jshint ignore:line

        inject(function ($injector) {
          permPermissionStore = $injector.get('permPermissionStore');
          permRoleStore = $injector.get('permRoleStore');
          permPermissionMap = $injector.get('permPermissionMap');
          permAuthorization = $injector.get('permAuthorization');
        });
      });

      describe('method: authorize', function () {
        beforeEach(function () {
          permPermissionStore.definePermission('USER', function () {
            return true;
          });

          permPermissionStore.definePermission('ADMIN', function () {
            return false;
          });

          permRoleStore.defineRole('ACCOUNTANT', ['USER']);
          permRoleStore.defineRole('ADMIN_ACCOUNTANT', ['ADMIN']);
        });

        it('should resolve promise when "only" matches permissions', function () {
          // GIVEN
          var permissionMap = new permPermissionMap({only: ['USER']});

          // WHEN
          var promise = permAuthorization.authorize(permissionMap);

          // THEN
          expect(promise).toBeResolved();
        });

        it('should resolve promise when "only" matches roles', function () {
          // GIVEN
          var permissionMap = new permPermissionMap({only: ['ACCOUNTANT']});

          // WHEN
          var promise = permAuthorization.authorize(permissionMap);

          // THEN
          expect(promise).toBeResolved();
        });

        it('should reject promise when "only" mismatches permissions', function () {
          // GIVEN
          var permissionMap = new permPermissionMap({only: ['ADMIN']});

          // WHEN
          var promise = permAuthorization.authorize(permissionMap);

          // THEN
          expect(promise).toBeRejected();
        });

        it('should reject promise when "only" mismatches roles', function () {
          // GIVEN
          var permissionMap = new permPermissionMap({only: ['ADMIN_ACCOUNTANT']});

          // WHEN
          var promise = permAuthorization.authorize(permissionMap);

          // THEN
          expect(promise).toBeRejected();
        });

        it('should resolve promise when "except" mismatches permissions', function () {
          // GIVEN
          var permissionMap = new permPermissionMap({except: ['ADMIN']});

          // WHEN
          var promise = permAuthorization.authorize(permissionMap);

          // THEN
          expect(promise).toBeResolved();
        });

        it('should resolve promise when "except" mismatches roles', function () {
          // GIVEN
          var permissionMap = new permPermissionMap({except: ['ADMIN_ACCOUNTANT']});

          // WHEN
          var promise = permAuthorization.authorize(permissionMap);

          // THEN
          expect(promise).toBeResolved();
        });

        it('should reject promise when "except" matches permissions', function () {
          // GIVEN
          var permissionMap = new permPermissionMap({except: ['USER']});

          // WHEN
          var promise = permAuthorization.authorize(permissionMap);

          // THEN
          expect(promise).toBeRejected();
        });

        it('should reject promise when "except" matches roles', function () {
          // GIVEN
          var permissionMap = new permPermissionMap({except: ['ACCOUNTANT']});

          // WHEN
          var promise = permAuthorization.authorize(permissionMap);

          // THEN
          expect(promise).toBeRejected();
        });

        it('should reject promise when permission/role is undefined', function () {
          // GIVEN
          var permissionMap = new permPermissionMap({only: ['SUPER_ADMIN']});

          // WHEN
          var promise = permAuthorization.authorize(permissionMap);

          // THEN
          expect(promise).toBeRejected();
        });
      });
    });
  });
});