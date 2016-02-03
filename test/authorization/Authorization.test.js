describe('service: Authorization', function () {
  'use strict';

  var $q, $rootScope, PermissionStore, RoleStore, PermissionMap, Authorization;

  beforeEach(function () {
    module('permission');

    inject(function ($injector) {
      PermissionStore = $injector.get('PermissionStore');
      RoleStore = $injector.get('RoleStore');
      PermissionMap = $injector.get('PermissionMap');
      Authorization = $injector.get('Authorization');
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');
    });
  });

  describe('method: authorize', function () {

    var isResolved;

    beforeEach(function () {
      PermissionStore.definePermission('USER', function () {
        return true;
      });

      PermissionStore.definePermission('ADMIN', function () {
        return false;
      });

      RoleStore.defineRole('ACCOUNTANT', ['USER']);
      RoleStore.defineRole('ADMIN_ACCOUNTANT', ['ADMIN']);

      isResolved = false;
    });

    it('should resolve promise when "only" matches permissions', function () {
      // GIVEN
      Authorization
        .authorize(new PermissionMap({only: ['USER']}), null)
        .then(function () {
          isResolved = true;
        });

      // WHEN
      $rootScope.$apply();

      // THEN
      expect(isResolved).toEqual(true);
    });

    it('should resolve promise when "only" matches roles', function () {
      // GIVEN
      Authorization
        .authorize(new PermissionMap({only: ['ACCOUNTANT']}))
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
        .authorize(new PermissionMap({only: ['ADMIN']}))
        .catch(function () {
          isResolved = true;
        });

      // WHEN
      $rootScope.$apply();

      // THEN
      expect(isResolved).toEqual(true);
    });

    it('should reject promise when "only" mismatches roles', function () {
      // GIVEN
      Authorization
        .authorize(new PermissionMap({only: ['ADMIN_ACCOUNTANT']}))
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
        .authorize(new PermissionMap({except: ['ADMIN']}))
        .then(function () {
          isResolved = true;
        });

      // WHEN
      $rootScope.$apply();

      // THEN
      expect(isResolved).toEqual(true);
    });

    it('should resolve promise when "except" mismatches roles', function () {
      // GIVEN
      Authorization
        .authorize(new PermissionMap({except: ['ADMIN_ACCOUNTANT']}))
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
        .authorize(new PermissionMap({except: ['USER']}))
        .catch(function () {
          isResolved = true;
        });

      // WHEN
      $rootScope.$apply();

      // THEN
      expect(isResolved).toEqual(true);
    });

    it('should reject promise when "except" matches roles', function () {
      // GIVEN
      Authorization
        .authorize(new PermissionMap({except: ['ACCOUNTANT']}))
        .catch(function () {
          isResolved = true;
        });

      // WHEN
      $rootScope.$apply();

      // THEN
      expect(isResolved).toEqual(true);
    });

    it('should reject promise when permission/role is undefined', function () {
      // GIVEN
      Authorization
        .authorize(new PermissionMap({only: ['SUPER_ADMIN']}))
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