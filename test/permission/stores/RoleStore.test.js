describe('permission', function () {
  'use strict';

  describe('stores', function () {
    describe('service: permRoleStore', function () {

      var permRoleStore;
      var permPermissionStore;
      var permRole;

      beforeEach(function () {
        module('permission');
      });

      beforeEach(function () {
        inject(function ($injector) {
          permRole = $injector.get('permRole');
          permRoleStore = $injector.get('permRoleStore');
          permPermissionStore = $injector.get('permPermissionStore');
        });
      });

      beforeEach(function () {
        permPermissionStore.definePermission('USER', function () {
          return true;
        });

        permRoleStore.defineRole('ACCOUNTANT', ['USER']);

        permRoleStore.defineRole('MANGER', [], function () {
          return true;
        });
      });

      describe('method: defineRole', function () {
        it('should add role definition to store when passed array of permissions', function () {
          // GIVEN
          // WHEN
          // THEN
          expect(permRoleStore.hasRoleDefinition('ACCOUNTANT')).toBe(true);
        });

        it('should add role definition to store when passed validation function', function () {
          // GIVEN
          // WHEN
          // THEN
          expect(permRoleStore.hasRoleDefinition('MANGER')).toBe(true);
        });
      });

      describe('method: defineManyRoles', function () {
        it('should throw error if roleNames is not Object', function () {
          // GIVEN
          // WHEN
          // THEN
          expect(function () {
            permRoleStore.defineManyRoles(null);
          }).toThrow(new TypeError('Parameter "roleNames" name must be object'));
        });

        it('should add role definitions to store for correct set of parameters', function () {
          // GIVEN
          // WHEN
          permRoleStore.defineManyRoles({
            'USER': ['canRead'],
            'ADMIN': ['canRead', 'canWrite']
          });

          // THEN
          expect(permRoleStore.hasRoleDefinition('USER')).toBe(true);
          expect(permRoleStore.hasRoleDefinition('ADMIN')).toBe(true);
        });
      });

      describe('method: getRoleDefinition', function () {
        it('should return role definition object', function () {
          // GIVEN
          // WHEN
          var permission = permRoleStore.getRoleDefinition('ACCOUNTANT');

          // THEN
          expect(permission instanceof permRole).toBeTruthy();
        });
      });

      describe('method: hasRoleDefinition', function () {
        it('should check if role is defined when passed array of permissions', function () {
          // GIVEN
          // WHEN
          // THEN
          expect(permRoleStore.hasRoleDefinition('ACCOUNTANT')).toBeTruthy();
        });

        it('should check if role is defined when passed validation function', function () {
          // GIVEN
          // WHEN
          // THEN
          expect(permRoleStore.hasRoleDefinition('MANGER')).toBeTruthy();
        });
      });

      describe('method: getStore', function () {
        it('should return all defined roles', function () {
          // GIVEN
          // WHEN
          var store = permRoleStore.getStore();
          // THEN
          expect(Object.keys(store).length).toEqual(2);
        });
      });

      describe('method: clearStore', function () {
        it('should remove all role definitions', function () {
          // GIVEN
          // WHEN
          permRoleStore.clearStore();

          // THEN
          expect(Object.keys(permRoleStore.getStore()).length).toBe(0);
        });
      });

      describe('method: removeRoleDefinition', function () {
        it('should remove role definition from store', function () {
          // GIVEN
          // WHEN
          permRoleStore.removeRoleDefinition('ACCOUNTANT');

          // THEN
          expect(permRoleStore.hasRoleDefinition('ACCOUNTANT')).toBeFalsy();
        });
      });
    });
  });
});