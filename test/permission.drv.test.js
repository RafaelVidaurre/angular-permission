describe('directive: Permission', function () {
  'use strict';

  var $q, $compile, $rootScope, Permission;

  beforeEach(function () {
    // Instantiate module
    module('permission');

    // Inject services into module
    inject(function ($injector) {
      $compile = $injector.get('$compile');
      $rootScope = $injector.get('$rootScope');
      $q = $injector.get('$q');
      Permission = $injector.get('Permission');
    });
  });

  describe('directive: permissionOnly', function () {

    it('should show element if authorized', function () {
      // GIVEN
      var element = angular.element('<div permission-only="USER"></div>');
      var dfd = $q.defer();
      dfd.resolve();
      spyOn(Permission, 'authorize').andReturn(dfd.promise);

      // WHEN
      $compile(element)($rootScope.$new());
      $rootScope.$apply();

      // THEN
      expect(element.hasClass('ng-hide')).toBeFalsy();
    });

    it('should hide element if unauthorized', function () {
      // GIVEN
      var element = angular.element('<div permission-only="USER"></div>');
      var dfd = $q.defer();
      dfd.reject();
      spyOn(Permission, 'authorize').andReturn(dfd.promise);

      // WHEN
      $compile(element)($rootScope.$new());
      $rootScope.$apply();

      // THEN
      expect(element.hasClass('ng-hide')).toBeTruthy();
    });

    it('should accept single role', function () {
      // GIVEN
      var element = angular.element('<div permission-only="USER"></div>');
      spyOn(Permission, 'authorize');

      // WHEN
      $compile(element)($rootScope.$new());
      $rootScope.$apply();

      // THEN
      expect(Permission.authorize).toHaveBeenCalledWith({only: ['USER']});
    });

    it('should accept multiple roles', function () {
      // GIVEN
      var element = angular.element('<div permission-only="USER, ADMIN"></div>');
      spyOn(Permission, 'authorize');

      // WHEN
      $compile(element)($rootScope.$new());
      $rootScope.$apply();

      // THEN
      expect(Permission.authorize).toHaveBeenCalledWith({only: ['USER', 'ADMIN']});
    });
  });

  describe('directive: permissionExcept', function () {

    it('should show element if authorized', function () {
      // GIVEN
      var element = angular.element('<div permission-except="USER"></div>');
      var dfd = $q.defer();
      dfd.resolve();
      spyOn(Permission, 'authorize').andReturn(dfd.promise);

      // WHEN
      $compile(element)($rootScope.$new());
      $rootScope.$apply();

      // THEN
      expect(element.hasClass('ng-hide')).toBeFalsy();
    });

    it('should hide element if unauthorized', function () {
      // GIVEN
      var element = angular.element('<div permission-except="USER"></div>');
      var dfd = $q.defer();
      dfd.reject();
      spyOn(Permission, 'authorize').andReturn(dfd.promise);

      // WHEN
      $compile(element)($rootScope.$new());
      $rootScope.$apply();

      // THEN
      expect(element.hasClass('ng-hide')).toBeTruthy();
    });

    it('should accept single role', function () {
      // GIVEN
      var element = angular.element('<div permission-except="USER"></div>');
      spyOn(Permission, 'authorize');

      // WHEN
      $compile(element)($rootScope.$new());
      $rootScope.$apply();

      // THEN
      expect(Permission.authorize).toHaveBeenCalledWith({except: ['USER']});
    });

    it('should accept multiple roles', function () {
      // GIVEN
      var element = angular.element('<div permission-except="USER, ADMIN"></div>');
      spyOn(Permission, 'authorize');

      // WHEN
      $compile(element)($rootScope.$new());
      $rootScope.$apply();

      // THEN
      expect(Permission.authorize).toHaveBeenCalledWith({except: ['USER', 'ADMIN']});
    });
  });
});