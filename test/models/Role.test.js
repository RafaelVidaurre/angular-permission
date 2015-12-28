describe('model: Permission', function () {
  'use strict';

  var $q, $rootScope, Role;

  beforeEach(function () {
    module('permission');

    inject(function ($injector) {
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');
      Role = $injector.get('Role');
    });
  });

  describe('method: Role', function () {
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
      var permissionName = 'user';
      var permissionNames = [];

      // WHEN
      var role = new Role(permissionName, permissionNames);

      // THEN
      expect(role.roleName).toBe(permissionName);
      expect(role.permissionNames).toBe(permissionNames);
    });
  });
});