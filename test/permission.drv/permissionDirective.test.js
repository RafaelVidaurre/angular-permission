describe('directive: Permission', function () {
  'use strict';

  var $q, $compile, $rootScope, Permission, PermissionProvider;


  beforeEach(function () {
    // Instantiate module
    module('permission', function ($injector) {
      PermissionProvider = $injector.get('PermissionProvider');
    });

    // Inject services into module
    inject(function ($injector) {
      $compile = $injector.get('$compile');
      $rootScope = $injector.get('$rootScope').$new();
      $q = $injector.get('$q');
      Permission = $injector.get('Permission');
    });
  });

  // Initialize permissions
  beforeEach(function () {
    PermissionProvider.setPermission('USER', function () {
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
    spyOn(Permission, 'authorize');

    // WHEN
    $compile(element)($rootScope);
    $rootScope.$digest();

    // THEN
    expect(Permission.authorize).toHaveBeenCalledWith({only: undefined, except: ['USER']}, null);
  });
});