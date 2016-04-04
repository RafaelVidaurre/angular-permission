describe('strategies: PermissionStrategies', function () {
  'use strict';

  var $compile;
  var $rootScope;
  var PermissionStore;
  var PermissionStrategies;

  beforeEach(function () {
    // Instantiate module
    module('permission');

    // Inject services into module
    inject(function ($injector) {
      $compile = $injector.get('$compile');
      $rootScope = $injector.get('$rootScope').$new();
      PermissionStore = $injector.get('PermissionStore');
      PermissionStrategies = $injector.get('PermissionStrategies');
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

  it('should disable element when "disableElement" strategy is applied', function () {
    // GIVEN
    $rootScope.onUnauthorized = PermissionStrategies.disableElement;
    $rootScope.only = ['ADMIN'];

    // WHEN
    var element = $compile('<input permission ' +
      'permission-only="only" ' +
      'permission-on-unauthorized="onUnauthorized">')($rootScope);

    $rootScope.$digest();

    // THEN
    expect(element.attr('disabled')).toEqual('disabled');
  });

  it('should enable element when "enableElement" strategy is applied', function () {
    // GIVEN
    $rootScope.onAuthorized = PermissionStrategies.enableElement;
    $rootScope.only = ['USER'];

    // WHEN
    var element = $compile('<input permission ' +
      'permission-only="only" ' +
      'permission-on-authorized="onAuthorized" ' +
      'disabled="disabled">')($rootScope);

    $rootScope.$digest();

    expect(element.attr('disabled')).not.toBeDefined();
  });

  it('should hide element when "hideElement" strategy is applied', function () {
    // GIVEN
    $rootScope.onUnauthorized = PermissionStrategies.hideElement;
    $rootScope.only = ['ADMIN'];

    // WHEN
    var element = $compile('<input permission ' +
      'permission-only="only" ' +
      'permission-on-unauthorized="onUnauthorized">')($rootScope);

    $rootScope.$digest();

    // THEN
    expect(element.hasClass('ng-hide')).toBeTruthy();
  });

  it('should show element when "showElement" strategy is applied', function () {
    // GIVEN
    $rootScope.onAuthorized = PermissionStrategies.showElement;
    $rootScope.only = ['USER'];

    // WHEN
    var element = $compile('<input permission ' +
      'permission-only="only" ' +
      'permission-on-authorized="onAuthorized">')($rootScope);

    $rootScope.$digest();

    expect(element.hasClass('ng-hide')).toBeFalsy();
  });
});