describe('permission', function () {
  'use strict';

  describe('stores', function () {
    describe('service: PermPermissionStore', function () {

      var PermPermissionStore;
      var PermPermission;

      beforeEach(function () {
        module('permission');

        inject(function ($injector) {
          PermPermissionStore = $injector.get('PermPermissionStore');
          PermPermission = $injector.get('PermPermission');
        });
      });

      describe('method: definePermission', function () {
        it('should add permission definition to store for correct parameters', function () {
          // GIVEN
          // WHEN
          PermPermissionStore.definePermission('user', function () {
            return true;
          });
          // THEN
          expect(PermPermissionStore.hasPermissionDefinition('user')).toBe(true);
        });
      });

      describe('method: defineManyPermissions', function () {
        it('should throw error if permissionNames is not Array', function () {
          // GIVEN
          // WHEN
          // THEN
          expect(function () {
            PermPermissionStore.defineManyPermissions({}, null);
          }).toThrow(new TypeError('Parameter "permissionNames" name must be Array'));
        });

        it('should add permission definitions to store for correct set of parameters', function () {
          // GIVEN
          // WHEN
          PermPermissionStore.defineManyPermissions(['user', 'admin'], function () {
            return true;
          });

          // THEN
          expect(PermPermissionStore.hasPermissionDefinition('user')).toBe(true);
          expect(PermPermissionStore.hasPermissionDefinition('admin')).toBe(true);
        });
      });

      describe('method: getPermissionDefinition', function () {
        it('should return permission definition object', function () {
          // GIVEN
          PermPermissionStore.definePermission('USER', function () {
            return true;
          });
          // WHEN
          var permission = PermPermissionStore.getPermissionDefinition('USER');

          // THEN
          expect(permission instanceof PermPermission).toBeTruthy();
        });
      });

      describe('method: hasPermissionDefinition', function () {
        it('should check if permission is defined', function () {
          // GIVEN
          // WHEN
          PermPermissionStore.definePermission('user', function () {
            return true;
          });

          // THEN
          expect(PermPermissionStore.hasPermissionDefinition('user')).toBeTruthy();
          expect(PermPermissionStore.hasPermissionDefinition('admin')).toBeFalsy();
        });
      });

      describe('method: clearStore', function () {
        it('should remove all permission definitions', function () {
          // GIVEN
          PermPermissionStore.defineManyPermissions(['user', 'admin', 'superAdmin'], function () {
            return true;
          });

          // WHEN
          PermPermissionStore.clearStore();

          // THEN
          expect(Object.keys(PermPermissionStore.getStore()).length).toBe(0);
        });
      });

      describe('method: removePermissionDefinition', function () {
        it('should remove definition from store', function () {
          // GIVEN
          PermPermissionStore.defineManyPermissions(['user', 'admin'], function () {
            return true;
          });

          // WHEN
          PermPermissionStore.removePermissionDefinition('user');

          // THEN
          expect(PermPermissionStore.hasPermissionDefinition('user')).toBeFalsy();
          expect(PermPermissionStore.hasPermissionDefinition('admin')).toBeTruthy();
        });
      });
    });
  });
});