describe('model: Role', function () {
  'use strict';

  var $q, $rootScope, Role, PermissionStore;

  beforeEach(function () {
    module('permission');

    inject(function ($injector) {
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');
      Role = $injector.get('Role');
      PermissionStore = $injector.get('PermissionStore');
    });
  });

  describe('constructor: Role', function () {
    it('should throw an exception on invalid roleName', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(function () {
        new Role(null, function () {
          return true;
        });
      }).toThrow(new TypeError('Parameter "roleName" name must be String'));
    });

    it('should throw an exception on invalid validationFunction', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(function () {
        new Role('valid-name', undefined);
      }).toThrow(new TypeError('Parameter "permissionNames" must be Array'));
    });

    it('should return new role definition instance for correct parameters', function () {
      // GIVEN
      var permissionName = 'ACCOUNTANT';
      var permissionNames = [];

      // WHEN
      var role = new Role(permissionName, permissionNames, function () {
        return true;
      });

      // THEN
      expect(role.roleName).toBe(permissionName);
      expect(role.permissionNames).toBe(permissionNames);
    });


    it('should add permission definitions to PermissionStore when provided validationFunction', function () {
      // GIVEN
      var validationFunction = function () {
        return true;
      };
      // WHEN
      new Role('ACCOUNTANT', ['USER'], validationFunction);
      // THEN
      expect(PermissionStore.hasPermissionDefinition('USER')).toBe(true);
      expect(PermissionStore.getPermissionDefinition('USER').validationFunction).toBe(validationFunction);
    });

    it('should call directly validationFunction when no permissions were provided', function () {
      // GIVEN
      var role = new Role('ACCOUNTANT', [], function () {
        return true;
      });
      spyOn(role, 'validationFunction').and.callThrough();

      // WHEN
      role.validateRole();

      // THEN
      expect(role.validationFunction).toHaveBeenCalled();
    });

    it('should call validationFunction through permission definitions when provided', function () {
      // GIVEN
      var role = new Role('ACCOUNTANT', ['USER'], function () {
        return true;
      });
      var userDefinition = PermissionStore.getPermissionDefinition('USER');
      spyOn(userDefinition, 'validationFunction').and.callThrough();

      // WHEN
      role.validateRole();

      // THEN
      expect(userDefinition.validationFunction).toHaveBeenCalled();
    });
  });
});