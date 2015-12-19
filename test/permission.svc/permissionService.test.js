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

  describe('method: setPermission', function () {
    it('should call setPermission defined in provider', function () {
      // GIVEN
      spyOn(PermissionProvider, 'setPermission');

      // WHEN
      Permission.setPermission('user', function () {
        return true;
      });

      // THEN
      expect(PermissionProvider.setPermission).toHaveBeenCalled();
    });
  });

  describe('method: setManyPermissions', function () {
    it('should call setManyPermissions defined in provider', function () {
      // GIVEN
      spyOn(PermissionProvider, 'setManyPermissions');

      // WHEN
      Permission.setManyPermissions(['user', 'admin'], function () {
        return true;
      });

      expect(PermissionProvider.setManyPermissions).toHaveBeenCalled();
    });
  });

  describe('method: authorize', function () {

    var isResolved;

    beforeEach(function () {
      Permission.setPermission('user', function () {
        return true;
      });

      isResolved = false;
    });

    it('should throw error when permissionMap is not object', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(function () {
        Permission.authorize('notObject', null);
      }).toThrow(new TypeError('Parameter "permissionMap" has to be Object'));
    });

    it('should throw error when permissionMap has not set neither "only" nor "except"', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(function () {
        Permission.authorize({}, null);
      }).toThrow(new ReferenceError('Either "only" or "except" keys must me defined'));
    });

    it('should throw error when permissionMap property "only" is not Array', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(function () {
        Permission.authorize({only: null}, null);
      }).toThrow(new TypeError('Parameter "permissionMap" properties must be Array'));
    });

    it('should throw error when permissionMap property "except" is not Array', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(function () {
        Permission.authorize({except: null}, null);
      }).toThrow(new TypeError('Parameter "permissionMap" properties must be Array'));
    });

    it('should resolve promise when "only" matches permissions', function () {
      // GIVEN
      Permission
        .authorize({only: ['user']}, null)
        .then(function () {
          isResolved = true;
        });

      // WHEN
      $rootScope.$apply();

      // THEN
      expect(isResolved).toEqual(true);
    });

    it('should reject promise when "only" mismatches permissions', function () {
      // GIVEN
      Permission
        .authorize({only: ['admin']}, null)
        .catch(function () {
          isResolved = true;
        });

      // WHEN
      $rootScope.$apply();

      // THEN
      expect(isResolved).toEqual(true);
    });

    it('should resolve promise when "except" mismatches permissions', function () {
      // GIVEN
      Permission
        .authorize({except: ['admin']}, null)
        .then(function () {
          isResolved = true;
        });

      // WHEN
      $rootScope.$apply();

      // THEN
      expect(isResolved).toEqual(true);
    });

    it('should reject promise when "except" matches permissions', function () {
      // GIVEN
      Permission
        .authorize({except: ['user']}, null)
        .catch(function () {
          isResolved = true;
        });

      // WHEN
      $rootScope.$apply();

      // THEN
      expect(isResolved).toEqual(true);
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