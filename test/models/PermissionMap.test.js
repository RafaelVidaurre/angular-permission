describe('model: PermissionMap', function () {
  'use strict';

  var $q, $rootScope, PermissionMap;

  beforeEach(function () {
    module('permission');

    inject(function ($injector) {
      PermissionMap = $injector.get('PermissionMap');
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');
    });
  });

  describe('constructor: PermissionMap', function () {

    it('should throw error when permissionMap is not object', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(function () {
        new PermissionMap('notObject');
      }).toThrow(new TypeError('Parameter "permissionMap" has to be Object'));
    });

    it('should throw error when permissionMap has not set neither "only" nor "except"', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(function () {
        new PermissionMap({});
      }).toThrow(new ReferenceError('Either "only" or "except" keys must me defined'));
    });

    it('should throw error when permissionMap property "only" is not Array', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(function () {
        new PermissionMap({only: null});
      }).toThrow(new TypeError('Parameter "permissionMap" properties must be Array'));
    });

    it('should throw error when permissionMap property "except" is not Array', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(function () {
        new PermissionMap({except: null});
      }).toThrow(new TypeError('Parameter "permissionMap" properties must be Array'));
    });
  });
});