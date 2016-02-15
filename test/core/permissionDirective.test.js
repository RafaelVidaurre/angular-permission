describe('directive: Permission', function () {
  'use strict';

  var $q, $compile, $rootScope, Authorization, PermissionStore, PermissionMap;


  beforeEach(function () {
    // Instantiate module
    module('permission');

    // Inject services into module
    inject(function ($injector) {
      $q = $injector.get('$q');
      $compile = $injector.get('$compile');
      $rootScope = $injector.get('$rootScope').$new();
      Authorization = $injector.get('Authorization');
      PermissionStore = $injector.get('PermissionStore');
      PermissionMap = $injector.get('PermissionMap');
    });
  });

  // Initialize permissions
  beforeEach(function () {
    PermissionStore.definePermission('USER', function () {
      return true;
    });

    PermissionStore.definePermission('ADMIN', function () {
      return false;
    });
  });

  it('should show element if authorized when permissions are passed as string array', function () {
    // GIVEN
    var element = angular.element('<div permission only="[\'USER\']"></div>');

    // WHEN
    $compile(element)($rootScope);
    $rootScope.$digest();

    // THEN
    expect(element.hasClass('ng-hide')).toBeFalsy();
  });

  it('should show element if authorized when permissions are passed as variable reference', function () {
    // GIVEN
    var element = angular.element('<div permission only="only"></div>');
    $rootScope.only = ['USER'];

    // WHEN
    $compile(element)($rootScope);
    $rootScope.$digest();

    // THEN
    expect(element.hasClass('ng-hide')).toBeFalsy();
  });

  it('should hide element if unauthorized when permissions are passed as string array', function () {
    // GIVEN
    var element = angular.element('<div permission except="[\'USER\']"></div>');

    // WHEN
    $compile(element)($rootScope);
    $rootScope.$digest();

    // THEN
    expect(element.hasClass('ng-hide')).toBeTruthy();
  });

  it('should hide element if unauthorized when permissions are passed as variable reference', function () {
    // GIVEN
    var element = angular.element('<div permission except="except"></div>');
    $rootScope.except = ['USER'];

    // WHEN
    $compile(element)($rootScope);
    $rootScope.$digest();

    // THEN
    expect(element.hasClass('ng-hide')).toBeTruthy();
  });

  it('should watch for changes in "only" and "except" attributes', function () {
    // GIVEN
    var element = angular.element('<div permission only="only"></div>');
    $rootScope.only = ['USER'];
    $compile(element)($rootScope);
    $rootScope.$digest();

    // WHEN
    $rootScope.only = ['ADMIN'];
    $rootScope.$digest();

    // THEN
    expect(element.hasClass('ng-hide')).toBeTruthy();
  });

  it('should call authorize method', function () {
    // GIVEN
    var element = angular.element('<div permission except="[\'USER\']"></div>');
    spyOn(Authorization, 'authorize');

    // WHEN
    $compile(element)($rootScope);
    $rootScope.$digest();

    // THEN
    expect(Authorization.authorize).toHaveBeenCalledWith(new PermissionMap({only: undefined, except: ['USER']}), null);
  });
});