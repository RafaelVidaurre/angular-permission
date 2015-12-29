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
  });
});