describe('model: Role', /**
 *
 */
function () {
  'use strict';

  var Role;
  var PermissionStore;

  beforeEach(function () {
    module('permission');

    installPromiseMatchers(); // jshint ignore:line

    inject(function ($injector) {
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

    it('should throw an exception when neither permission names nor validationFunction are provided', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(function () {
        new Role('valid-name',[]);
      }).toThrow(new TypeError('Parameter "validationFunction" must be provided for empty "permissionNames" array'));
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

    it('should return rejected promise when at leas one of permissions is not defined', function () {
      // GIVEN
      var role = new Role('ACCOUNTANT', ['FAKE']);

      // WHEN
      var promise = role.validateRole();

      // THEN
      expect(promise).toBeRejected();
    });
  });
});