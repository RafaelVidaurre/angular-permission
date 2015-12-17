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

  describe('provider: PermissionProvider', function () {

    describe('method: setPermission', function () {
      it('should throw an exception on invalid permission', function () {
        // GIVEN
        // WHEN
        // THEN
        expect(function () {
          PermissionProvider.setPermission(null, function () {
            return true;
          });
        }).toThrow(new TypeError('Parameter "permission" name must be String'));
      });

      it('should throw an exception on invalid validationFunction', function () {
        // GIVEN
        // WHEN
        // THEN
        expect(function () {
          PermissionProvider.setPermission('valid-name', undefined);
        }).toThrow(new TypeError('Parameter "validationFunction" must be Function'));
      });

      it('should set permission for correct parameters', function () {
        // GIVEN
        // WHEN
        PermissionProvider.setPermission('user', function () {
          return true;
        });
        // THEN
        expect(Permission.hasPermission('user')).toBe(true);
      });
    });

    describe('method: setManyPermissions', function () {
      it('should throw an exception if permissions are not array', function () {
        // GIVEN
        // WHEN
        // THEN
        expect(function () {
          PermissionProvider.setManyPermissions(null, function () {
          });
        }).toThrow(new TypeError('Parameter "permissions" name must be Array'));
      });

      it('should set permissions for correct set of parameters', function () {
        // GIVEN
        // WHEN
        PermissionProvider.setManyPermissions(['user', 'admin'], function () {
          return true;
        });

        // THEN
        expect(Permission.hasPermission('user')).toBe(true);
        expect(Permission.hasPermission('admin')).toBe(true);
      });
    });
  });
});