describe('permission', function () {
  'use strict';

  describe('strategies', function () {
    describe('service: PermPermissionStrategies', function () {

      var $compile;
      var $rootScope;
      var PermPermissionStore;
      var PermPermissionStrategies;

      beforeEach(function () {
        // Instantiate module
        module('permission');

        // Inject services into module
        inject(function ($injector) {
          $compile = $injector.get('$compile');
          $rootScope = $injector.get('$rootScope').$new();
          PermPermissionStore = $injector.get('PermPermissionStore');
          PermPermissionStrategies = $injector.get('PermPermissionStrategies');
        });
      });

      // Initialize permissions
      beforeEach(function () {
        PermPermissionStore.definePermission('USER', function () {
          return true;
        });

        PermPermissionStore.definePermission('ADMIN', function () {
          return false;
        });
      });

      it('should disable element when "disableElement" strategy is applied', function () {
        // GIVEN
        $rootScope.onUnauthorized = PermPermissionStrategies.disableElement;
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
        $rootScope.onAuthorized = PermPermissionStrategies.enableElement;
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
        $rootScope.onUnauthorized = PermPermissionStrategies.hideElement;
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
        $rootScope.onAuthorized = PermPermissionStrategies.showElement;
        $rootScope.only = ['USER'];

        // WHEN
        var element = $compile('<input permission ' +
          'permission-only="only" ' +
          'permission-on-authorized="onAuthorized">')($rootScope);

        $rootScope.$digest();

        expect(element.hasClass('ng-hide')).toBeFalsy();
      });
    });
  });
});