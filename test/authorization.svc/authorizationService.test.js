describe('service: Authorization', function () {
  'use strict';

  var Permission, $q, $rootScope, PermissionProvider, Authorization;

  beforeEach(function () {
    module('permission', function (_PermissionProvider_) {
      PermissionProvider = _PermissionProvider_;
    });

    inject(function ($injector) {
      Permission = $injector.get('Permission');
      Authorization = $injector.get('Authorization');
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');
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
        Authorization.authorize('notObject', null);
      }).toThrow(new TypeError('Parameter "permissionMap" has to be Object'));
    });

    it('should throw error when permissionMap has not set neither "only" nor "except"', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(function () {
        Authorization.authorize({}, null);
      }).toThrow(new ReferenceError('Either "only" or "except" keys must me defined'));
    });

    it('should throw error when permissionMap property "only" is not Array', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(function () {
        Authorization.authorize({only: null}, null);
      }).toThrow(new TypeError('Parameter "permissionMap" properties must be Array'));
    });

    it('should throw error when permissionMap property "except" is not Array', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(function () {
        Authorization.authorize({except: null}, null);
      }).toThrow(new TypeError('Parameter "permissionMap" properties must be Array'));
    });

    it('should resolve promise when "only" matches permissions', function () {
      // GIVEN
      Authorization
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
      Authorization
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
      Authorization
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
      Authorization
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
});