describe('permission', function () {
  'use strict';

  describe('stores', function () {
    describe('service: permPermissionStore', function () {

      var permPermissionStore;
      var permPermission;

      beforeEach(function () {
        module('permission');

        inject(function ($injector) {
          permPermissionStore = $injector.get('permPermissionStore');
          permPermission = $injector.get('permPermission');
        });
      });

      describe('method: definePermission', function () {
        it('should add permission definition to store for correct parameters', function () {
          // GIVEN
          // WHEN
          permPermissionStore.definePermission('user', function () {
            return true;
          });
          // THEN
          expect(permPermissionStore.hasPermissionDefinition('user')).toBe(true);
        });
      });

      describe('method: defineManyPermissions', function () {
        it('should throw error if permissionNames is not Array', function () {
          // GIVEN
          // WHEN
          // THEN
          expect(function () {
            permPermissionStore.defineManyPermissions({}, null);
          }).toThrow(new TypeError('Parameter "permissionNames" name must be Array'));
        });

        it('should add permission definitions to store for correct set of parameters', function () {
          // GIVEN
          // WHEN
          permPermissionStore.defineManyPermissions(['user', 'admin'], function () {
            return true;
          });

          // THEN
          expect(permPermissionStore.hasPermissionDefinition('user')).toBe(true);
          expect(permPermissionStore.hasPermissionDefinition('admin')).toBe(true);
        });
      });

      describe('method: getPermissionDefinition', function () {
        it('should return permission definition object', function () {
          // GIVEN
          permPermissionStore.definePermission('USER', function () {
            return true;
          });
          // WHEN
          var permission = permPermissionStore.getPermissionDefinition('USER');

          // THEN
          expect(permission instanceof permPermission).toBeTruthy();
        });
      });

      describe('method: hasPermissionDefinition', function () {
        it('should check if permission is defined', function () {
          // GIVEN
          // WHEN
          permPermissionStore.definePermission('user', function () {
            return true;
          });

          // THEN
          expect(permPermissionStore.hasPermissionDefinition('user')).toBeTruthy();
          expect(permPermissionStore.hasPermissionDefinition('admin')).toBeFalsy();
        });
      });

      describe('method: clearStore', function () {
        it('should remove all permission definitions', function () {
          // GIVEN
          permPermissionStore.defineManyPermissions(['user', 'admin', 'superAdmin'], function () {
            return true;
          });

          // WHEN
          permPermissionStore.clearStore();

          // THEN
          expect(Object.keys(permPermissionStore.getStore()).length).toBe(0);
        });
      });

      describe('method: removePermissionDefinition', function () {
        it('should remove definition from store', function () {
          // GIVEN
          permPermissionStore.defineManyPermissions(['user', 'admin'], function () {
            return true;
          });

          // WHEN
          permPermissionStore.removePermissionDefinition('user');

          // THEN
          expect(permPermissionStore.hasPermissionDefinition('user')).toBeFalsy();
          expect(permPermissionStore.hasPermissionDefinition('admin')).toBeTruthy();
        });
      });
    });
  });
});