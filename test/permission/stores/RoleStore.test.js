describe('permission', function () {
  'use strict';

  describe('stores', function () {
    describe('service: PermRoleStore', function () {

      var PermRoleStore;
      var PermPermissionStore;
      var PermRole;

      beforeEach(function () {
        module('permission');
      });

      beforeEach(function () {
        inject(function ($injector) {
          PermRole = $injector.get('PermRole');
          PermRoleStore = $injector.get('PermRoleStore');
          PermPermissionStore = $injector.get('PermPermissionStore');
        });
      });

      beforeEach(function () {
        PermPermissionStore.definePermission('USER', function () {
          return true;
        });

        PermRoleStore.defineRole('ACCOUNTANT', ['USER']);

        PermRoleStore.defineRole('MANGER', [], function () {
          return true;
        });
      });

      describe('method: defineRole', function () {
        it('should add role definition to store when passed array of permissions', function () {
          // GIVEN
          // WHEN
          // THEN
          expect(PermRoleStore.hasRoleDefinition('ACCOUNTANT')).toBe(true);
        });

        it('should add role definition to store when passed validation function', function () {
          // GIVEN
          // WHEN
          // THEN
          expect(PermRoleStore.hasRoleDefinition('MANGER')).toBe(true);
        });
      });

      describe('method: defineManyRoles', function () {
        it('should throw error if roleNames is not Object', function () {
          // GIVEN
          // WHEN
          // THEN
          expect(function () {
            PermRoleStore.defineManyRoles(null);
          }).toThrow(new TypeError('Parameter "roleNames" name must be object'));
        });

        it('should add role definitions to store for correct set of parameters', function () {
          // GIVEN
          // WHEN
          PermRoleStore.defineManyRoles({
            'USER': ['canRead'],
            'ADMIN': ['canRead', 'canWrite']
          });

          // THEN
          expect(PermRoleStore.hasRoleDefinition('USER')).toBe(true);
          expect(PermRoleStore.hasRoleDefinition('ADMIN')).toBe(true);
        });
      });

      describe('method: getRoleDefinition', function () {
        it('should return role definition object', function () {
          // GIVEN
          // WHEN
          var permission = PermRoleStore.getRoleDefinition('ACCOUNTANT');

          // THEN
          expect(permission instanceof PermRole).toBeTruthy();
        });
      });

      describe('method: hasRoleDefinition', function () {
        it('should check if role is defined when passed array of permissions', function () {
          // GIVEN
          // WHEN
          // THEN
          expect(PermRoleStore.hasRoleDefinition('ACCOUNTANT')).toBeTruthy();
        });

        it('should check if role is defined when passed validation function', function () {
          // GIVEN
          // WHEN
          // THEN
          expect(PermRoleStore.hasRoleDefinition('MANGER')).toBeTruthy();
        });
      });

      describe('method: getStore', function () {
        it('should return all defined roles', function () {
          // GIVEN
          // WHEN
          var store = PermRoleStore.getStore();
          // THEN
          expect(Object.keys(store).length).toEqual(2);
        });
      });

      describe('method: clearStore', function () {
        it('should remove all role definitions', function () {
          // GIVEN
          // WHEN
          PermRoleStore.clearStore();

          // THEN
          expect(Object.keys(PermRoleStore.getStore()).length).toBe(0);
        });
      });

      describe('method: removeRoleDefinition', function () {
        it('should remove role definition from store', function () {
          // GIVEN
          // WHEN
          PermRoleStore.removeRoleDefinition('ACCOUNTANT');

          // THEN
          expect(PermRoleStore.hasRoleDefinition('ACCOUNTANT')).toBeFalsy();
        });
      });
    });
  });
});