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

  describe('provider: PermissionStore', function () {

    describe('method: setPermission', function () {
      it('should throw an exception on invalid permission', function () {
        // GIVEN
        // WHEN
        // THEN
        expect(function () {
          PermissionStore.setPermission(null, function () {
            return true;
          });
        }).toThrow(new TypeError('Parameter "permission" name must be String'));
      });

      it('should throw an exception on invalid validationFunction', function () {
        // GIVEN
        // WHEN
        // THEN
        expect(function () {
          PermissionStore.setPermission('valid-name', undefined);
        }).toThrow(new TypeError('Parameter "validationFunction" must be Function'));
      });

      it('should set permission for correct parameters', function () {
        // GIVEN
        // WHEN
        PermissionStore.setPermission('user', function () {
          return true;
        });
        // THEN
        expect(PermissionStore.hasPermission('user')).toBe(true);
      });
    });

    describe('method: setManyPermissions', function () {
      it('should throw an exception if permissions are not array', function () {
        // GIVEN
        // WHEN
        // THEN
        expect(function () {
          PermissionStore.setManyPermissions(null, function () {
          });
        }).toThrow(new TypeError('Parameter "permissionNames" name must be Array'));
      });

      it('should set permissions for correct set of parameters', function () {
        // GIVEN
        // WHEN
        PermissionStore.setManyPermissions(['user', 'admin'], function () {
          return true;
        });

        // THEN
        expect(PermissionStore.hasPermission('user')).toBe(true);
        expect(PermissionStore.hasPermission('admin')).toBe(true);
      });
    });
  });
});