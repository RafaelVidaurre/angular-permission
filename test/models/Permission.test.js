describe('model: Permission', function () {
  'use strict';

  var $q, $rootScope, Permission;

  beforeEach(function () {
    module('permission');

    inject(function ($injector) {
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');
      Permission = $injector.get('Permission');
    });
  });

  describe('constructor: Permission', function () {
    it('should throw an exception on invalid permissionName', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(function () {
        new Permission(null, function () {
          return true;
        });
      }).toThrow(new TypeError('Parameter "permissionName" name must be String'));
    });

    it('should throw an exception on invalid validationFunction', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(function () {
        new Permission('valid-name', undefined);
      }).toThrow(new TypeError('Parameter "validationFunction" must be Function'));
    });

    it('should return new permission definition instance for correct parameters', function () {
      // GIVEN
      var permissionName = 'user';
      var validationFunction = function () {
        return true;
      };

      // WHEN
      var permission = new Permission(permissionName, validationFunction);

      // THEN
      expect(permission.permissionName).toBe(permissionName);
      expect(permission.validationFunction).toBe(validationFunction);
    });
  });
});