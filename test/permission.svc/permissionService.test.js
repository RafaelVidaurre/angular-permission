describe('service: Permission', function () {
  'use strict';

  var Permission, $q, $rootScope, PermissionProvider;

  beforeEach(function () {
    module('permission', function (_PermissionProvider_) {
      PermissionProvider = _PermissionProvider_;
    });

    inject(function ($injector) {
      Permission = $injector.get('Permission');
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');
    });
  });

  describe('method: hasPermission', function () {
    it('should check if permission is set', function () {
      // GIVEN
      // WHEN
      Permission.setPermission('user', function () {
        return true;
      });

      // THEN
      expect(Permission.hasPermission('user')).toBeTruthy();
      expect(Permission.hasPermission('admin')).toBeFalsy();
    });
  });

  describe('method: clearPermissions', function () {
    it('should remove all set permissions', function () {
      // GIVEN
      Permission.setManyPermissions(['user', 'admin', 'superAdmin'], function () {
        return true;
      });

      // WHEN
      Permission.clearPermissions();

      // THEN
      expect(Permission.getPermissions().length).toBe(0);
    });
  });

  describe('method: removePermission', function () {
    it('should remove provided permission', function () {
      // GIVEN
      Permission.setManyPermissions(['user', 'admin'], function () {
        return true;
      });

      // WHEN
      Permission.removePermission('user');

      // THEN
      expect(Permission.hasPermission('user')).toBeFalsy();
      expect(Permission.hasPermission('admin')).toBeTruthy();
    });
  });

  describe('method: removeManyPermissions', function () {
    it('should remove provided set of permissions', function () {
      // GIVEN
      Permission.setManyPermissions(['user', 'admin', 'superAdmin'], function () {
        return true;
      });

      // WHEN
      Permission.removeManyPermissions(['user','admin']);

      // THEN
      expect(Permission.hasPermission('user')).toBeFalsy();
      expect(Permission.hasPermission('admin')).toBeFalsy();
      expect(Permission.hasPermission('superAdmin')).toBeTruthy();
    });
  });
});