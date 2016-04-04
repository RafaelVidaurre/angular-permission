describe('service: Authorization', function () {
  'use strict';

  var PermissionStore;
  var RoleStore;
  var PermissionMap;
  var Authorization;

  beforeEach(function () {
    module('permission');

    installPromiseMatchers(); // jshint ignore:line

    inject(function ($injector) {
      PermissionStore = $injector.get('PermissionStore');
      RoleStore = $injector.get('RoleStore');
      PermissionMap = $injector.get('PermissionMap');
      Authorization = $injector.get('Authorization');
    });
  });

  describe('method: authorize', function () {
    beforeEach(function () {
      PermissionStore.definePermission('USER', function () {
        return true;
      });

      PermissionStore.definePermission('ADMIN', function () {
        return false;
      });

      RoleStore.defineRole('ACCOUNTANT', ['USER']);
      RoleStore.defineRole('ADMIN_ACCOUNTANT', ['ADMIN']);
    });

    it('should resolve promise when "only" matches permissions', function () {
      // GIVEN
      var permissionMap = new PermissionMap({only: ['USER']});

      // WHEN
      var promise = Authorization.authorize(permissionMap);

      // THEN
      expect(promise).toBeResolved();
    });

    it('should resolve promise when "only" matches roles', function () {
      // GIVEN
      var permissionMap = new PermissionMap({only: ['ACCOUNTANT']});

      // WHEN
      var promise = Authorization.authorize(permissionMap);

      // THEN
      expect(promise).toBeResolved();
    });

    it('should reject promise when "only" mismatches permissions', function () {
      // GIVEN
      var permissionMap = new PermissionMap({only: ['ADMIN']});

      // WHEN
      var promise = Authorization.authorize(permissionMap);

      // THEN
      expect(promise).toBeRejected();
    });

    it('should reject promise when "only" mismatches roles', function () {
      // GIVEN
      var permissionMap = new PermissionMap({only: ['ADMIN_ACCOUNTANT']});

      // WHEN
      var promise = Authorization.authorize(permissionMap);

      // THEN
      expect(promise).toBeRejected();
    });

    it('should resolve promise when "except" mismatches permissions', function () {
      // GIVEN
      var permissionMap = new PermissionMap({except: ['ADMIN']});

      // WHEN
      var promise = Authorization.authorize(permissionMap);

      // THEN
      expect(promise).toBeResolved();
    });

    it('should resolve promise when "except" mismatches roles', function () {
      // GIVEN
      var permissionMap = new PermissionMap({except: ['ADMIN_ACCOUNTANT']});

      // WHEN
      var promise = Authorization.authorize(permissionMap);

      // THEN
      expect(promise).toBeResolved();
    });

    it('should reject promise when "except" matches permissions', function () {
      // GIVEN
      var permissionMap = new PermissionMap({except: ['USER']});

      // WHEN
      var promise = Authorization.authorize(permissionMap);

      // THEN
      expect(promise).toBeRejected();
    });

    it('should reject promise when "except" matches roles', function () {
      // GIVEN
      var permissionMap = new PermissionMap({except: ['ACCOUNTANT']});

      // WHEN
      var promise = Authorization.authorize(permissionMap);

      // THEN
      expect(promise).toBeRejected();
    });

    it('should reject promise when permission/role is undefined', function () {
      // GIVEN
      var permissionMap = new PermissionMap({only: ['SUPER_ADMIN']});

      // WHEN
      var promise = Authorization
        .authorize(permissionMap);

      // THEN
      expect(promise).toBeRejected();
    });
  });
});