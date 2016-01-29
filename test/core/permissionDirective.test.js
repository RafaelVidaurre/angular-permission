describe('directive: Permission', function () {
  'use strict';

  var $q, $compile, $rootScope, Authorization, PermissionStore;


  beforeEach(function () {
    // Instantiate module
    module('permission');

    // Inject services into module
    inject(function ($injector) {
      $compile = $injector.get('$compile');
      $rootScope = $injector.get('$rootScope').$new();
      $q = $injector.get('$q');
      Authorization = $injector.get('Authorization');
      PermissionStore = $injector.get('PermissionStore');
    });
  });

  // Initialize permissions
  beforeEach(function () {
    PermissionStore.definePermission('USER', function () {
      return true;
    });
  });

  it('should show element if authorized', function () {
    // GIVEN
    var element = angular.element('<div permission only="[\'USER\']"></div>');

    // WHEN
    $compile(element)($rootScope);
    $rootScope.$digest();

    // THEN
    expect(element.hasClass('ng-hide')).toBeFalsy();
  });

  it('should hide element if unauthorized', function () {
    // GIVEN
    var element = angular.element('<div permission except="[\'USER\']"></div>');

    // WHEN
    $compile(element)($rootScope);
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
    expect(Authorization.authorize).toHaveBeenCalledWith({only: undefined, except: ['USER']}, null);
  });
});