describe('service: PermissionStore', function () {
  'use strict';

  var $q, $rootScope, PermissionStore;

  beforeEach(function () {
    module('permission');

    inject(function ($injector) {
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');
      PermissionStore = $injector.get('PermissionStore');
    });
  });

  describe('method: hasPermission', function () {
    it('should check if permission is set', function () {
      // GIVEN
      // WHEN
      PermissionStore.setPermission('user', function () {
        return true;
      });

      // THEN
      expect(PermissionStore.hasPermission('user')).toBeTruthy();
      expect(PermissionStore.hasPermission('admin')).toBeFalsy();
    });
  });

  describe('method: clearPermissions', function () {
    it('should remove all set permissions', function () {
      // GIVEN
      PermissionStore.setManyPermissions(['user', 'admin', 'superAdmin'], function () {
        return true;
      });

      // WHEN
      PermissionStore.clearPermissions();

      // THEN
      expect(PermissionStore.getPermissions().length).toBe(0);
    });
  });

  describe('method: removePermission', function () {
    it('should remove provided permission', function () {
      // GIVEN
      PermissionStore.setManyPermissions(['user', 'admin'], function () {
        return true;
      });

      // WHEN
      PermissionStore.removePermission('user');

      // THEN
      expect(PermissionStore.hasPermission('user')).toBeFalsy();
      expect(PermissionStore.hasPermission('admin')).toBeTruthy();
    });
  });

  describe('method: removeManyPermissions', function () {
    it('should remove provided set of permissions', function () {
      // GIVEN
      PermissionStore.setManyPermissions(['user', 'admin', 'superAdmin'], function () {
        return true;
      });

      // WHEN
      PermissionStore.removeManyPermissions(['user', 'admin']);

      // THEN
      expect(PermissionStore.hasPermission('user')).toBeFalsy();
      expect(PermissionStore.hasPermission('admin')).toBeFalsy();
      expect(PermissionStore.hasPermission('superAdmin')).toBeTruthy();
    });
  });
});