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

  describe('method: definePermission', function () {
    it('should throw an exception on invalid permission', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(function () {
        PermissionStore.definePermission(null, function () {
          return true;
        });
      }).toThrow(new TypeError('Parameter "permission" name must be String'));
    });

    it('should throw an exception on invalid validationFunction', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(function () {
        PermissionStore.definePermission('valid-name', undefined);
      }).toThrow(new TypeError('Parameter "validationFunction" must be Function'));
    });

    it('should set permission for correct parameters', function () {
      // GIVEN
      // WHEN
      PermissionStore.definePermission('user', function () {
        return true;
      });
      // THEN
      expect(PermissionStore.hasPermission('user')).toBe(true);
    });
  });

  describe('method: defineManyPermissions', function () {
    it('should throw an exception if permissions are not array', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(function () {
        PermissionStore.defineManyPermissions(null, function () {
        });
      }).toThrow(new TypeError('Parameter "permissionNames" name must be Array'));
    });

    it('should set permissions for correct set of parameters', function () {
      // GIVEN
      // WHEN
      PermissionStore.defineManyPermissions(['user', 'admin'], function () {
        return true;
      });

      // THEN
      expect(PermissionStore.hasPermission('user')).toBe(true);
      expect(PermissionStore.hasPermission('admin')).toBe(true);
    });
  });

  describe('method: hasPermission', function () {
    it('should check if permission is set', function () {
      // GIVEN
      // WHEN
      PermissionStore.definePermission('user', function () {
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
      PermissionStore.defineManyPermissions(['user', 'admin', 'superAdmin'], function () {
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
      PermissionStore.defineManyPermissions(['user', 'admin'], function () {
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
      PermissionStore.defineManyPermissions(['user', 'admin', 'superAdmin'], function () {
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