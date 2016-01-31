describe('service: PermissionStore', function () {
  'use strict';

  var $q, $rootScope, PermissionStore, Permission;

  beforeEach(function () {
    module('permission');

    inject(function ($injector) {
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');
      PermissionStore = $injector.get('PermissionStore');
      Permission = $injector.get('Permission');
    });
  });

  describe('method: definePermission', function () {
    it('should add permission definition to store for correct parameters', function () {
      // GIVEN
      // WHEN
      PermissionStore.definePermission('user', function () {
        return true;
      });
      // THEN
      expect(PermissionStore.hasPermissionDefinition('user')).toBe(true);
    });
  });

  describe('method: defineManyPermissions', function () {
    it('should throw error if permissionNames is not Array', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(function () {
        PermissionStore.defineManyPermissions({}, null);
      }).toThrow(new TypeError('Parameter "permissionNames" name must be Array'));
    });

    it('should add permission definitions to store for correct set of parameters', function () {
      // GIVEN
      // WHEN
      PermissionStore.defineManyPermissions(['user', 'admin'], function () {
        return true;
      });

      // THEN
      expect(PermissionStore.hasPermissionDefinition('user')).toBe(true);
      expect(PermissionStore.hasPermissionDefinition('admin')).toBe(true);
    });
  });

  describe('method: getPermissionDefinition', function () {
    it('should return permission definition object', function () {
      // GIVEN
      PermissionStore.definePermission('USER', function () {
        return true;
      });
      // WHEN
      var permission = PermissionStore.getPermissionDefinition('USER');

      // THEN
      expect(permission instanceof Permission).toBeTruthy();
    });
  });

  describe('method: hasPermissionDefinition', function () {
    it('should check if permission is defined', function () {
      // GIVEN
      // WHEN
      PermissionStore.definePermission('user', function () {
        return true;
      });

      // THEN
      expect(PermissionStore.hasPermissionDefinition('user')).toBeTruthy();
      expect(PermissionStore.hasPermissionDefinition('admin')).toBeFalsy();
    });
  });

  describe('method: clearStore', function () {
    it('should remove all permission definitions', function () {
      // GIVEN
      PermissionStore.defineManyPermissions(['user', 'admin', 'superAdmin'], function () {
        return true;
      });

      // WHEN
      PermissionStore.clearStore();

      // THEN
      expect(Object.keys(PermissionStore.getStore()).length).toBe(0);
    });
  });

  describe('method: removePermissionDefinition', function () {
    it('should remove definition from store', function () {
      // GIVEN
      PermissionStore.defineManyPermissions(['user', 'admin'], function () {
        return true;
      });

      // WHEN
      PermissionStore.removePermissionDefinition('user');

      // THEN
      expect(PermissionStore.hasPermissionDefinition('user')).toBeFalsy();
      expect(PermissionStore.hasPermissionDefinition('admin')).toBeTruthy();
    });
  });
});