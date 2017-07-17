describe('permission', function () {
  'use strict';

  describe('directives', function () {
    describe('directive: Permission', function () {

      var $log;
      var $state;
      var $compile;
      var $rootScope;
      var $stateProvider;
      var PermAuthorization;
      var PermRoleStore;
      var PermPermissionMap;


      beforeEach(function () {
        // Instantiate module
        module('permission');

        module('ui.router', function ($injector) {
          $stateProvider = $injector.get('$stateProvider');
        });

        installPromiseMatchers(); // jshint ignore:line

        // Inject services into module
        inject(function ($injector) {
          $log = $injector.get('$log');
          $state = $injector.get('$state');
          $compile = $injector.get('$compile');
          $rootScope = $injector.get('$rootScope').$new();
          PermAuthorization = $injector.get('PermAuthorization');
          PermRoleStore = $injector.get('PermRoleStore');
          PermPermissionMap = $injector.get('PermPermissionMap');
        });
      });

      // Initialize permissions
      beforeEach(function () {
        PermRoleStore.defineRole('USER', function () {
          return true;
        });

        PermRoleStore.defineRole('AUTHORIZED', function () {
          return true;
        });

        PermRoleStore.defineRole('ADMIN', function () {
          return false;
        });
      });

      it('should show element if authorized when permissions are passed as string array', function () {
        // GIVEN
        var element = angular.element('<div permission permission-only="[\'USER\']"></div>');

        // WHEN
        $compile(element)($rootScope);
        $rootScope.$digest();

        // THEN
        expect(element.hasClass('ng-hide')).toBeFalsy();
      });

      it('should show element if authorized when permissions are passed as variable reference', function () {
        // GIVEN
        var element = angular.element('<div permission permission-only="only"></div>');
        $rootScope.only = ['USER'];

        // WHEN
        $compile(element)($rootScope);
        $rootScope.$digest();

        // THEN
        expect(element.hasClass('ng-hide')).toBeFalsy();
      });

      it('should show element if authorized when permissions are passed as variable reference [deprecated]', function () {
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
        var element = angular.element('<div permission permission-except="[\'USER\']"></div>');

        // WHEN
        $compile(element)($rootScope);
        $rootScope.$digest();

        // THEN
        expect(element.hasClass('ng-hide')).toBeTruthy();
      });

      it('should hide element if unauthorized when permissions are passed as variable reference', function () {
        // GIVEN
        var element = angular.element('<div permission permission-except="except"></div>');
        $rootScope.except = ['USER'];

        // WHEN
        $compile(element)($rootScope);
        $rootScope.$digest();

        // THEN
        expect(element.hasClass('ng-hide')).toBeTruthy();
      });

      it('should hide element when the event is triggered', function () {
        // GIVEN
        var element = angular.element('<div permission permission-event="\'permission:reload\'" permission-only="only"></div>');
        $rootScope.only = ['USER'];
        spyOn($rootScope, '$broadcast').and.callThrough();

        // WHEN
        $compile(element)($rootScope);
        $rootScope.$digest();

        // THEN
        expect(element.hasClass('ng-hide')).toBeFalsy();

        PermRoleStore.defineRole('USER', function () {
          return false;
        });
        $rootScope.$broadcast('permission:reload');
        $rootScope.$digest();

        expect(element.hasClass('ng-hide')).toBeTruthy();
      });

      it('should watch for changes in "permission-only" and "permission-except" attributes', function () {
        // GIVEN
        var element = angular.element('<div permission permission-only="only"></div>');
        $rootScope.only = ['USER'];
        $compile(element)($rootScope);
        $rootScope.$digest();

        // WHEN
        $rootScope.only = ['ADMIN'];
        $rootScope.$digest();

        // THEN
        expect(element.hasClass('ng-hide')).toBeTruthy();
      });

      it('should call provided "onAuthorized" function when authorized', function () {
        // GIVEN
        $rootScope.only = ['USER'];
        $rootScope.onAuthorized = function (element) {
          element.removeAttr('disabled');
        };

        spyOn($rootScope, 'onAuthorized').and.callThrough();

        // WHEN
        var element = $compile('<input permission permission-only="only" permission-on-authorized="onAuthorized" disabled="disabled">')($rootScope);
        $rootScope.$digest();

        // THEN
        expect($rootScope.onAuthorized).toHaveBeenCalled();
        expect(element.attr('disabled')).not.toBeDefined();
      });

      it('should call provided "onUnauthorized" function when authorized', function () {
        // GIVEN
        $rootScope.only = ['ADMIN'];
        $rootScope.onUnauthorized = function (element) {
          element.attr('disabled', 'disabled');
        };

        spyOn($rootScope, 'onUnauthorized').and.callThrough();

        // WHEN
        var element = $compile('<input permission permission-only="only" permission-on-unauthorized="onUnauthorized">')($rootScope);
        $rootScope.$digest();

        // THEN
        expect($rootScope.onUnauthorized).toHaveBeenCalled();
        expect(element.attr('disabled')).toEqual('disabled');
      });

      it('should call authorizeByPermissionMap method', function () {
        // GIVEN
        var element = angular.element('<div permission permission-except="[\'USER\']"></div>');
        spyOn(PermAuthorization, 'authorizeByPermissionMap');

        // WHEN
        $compile(element)($rootScope);
        $rootScope.$digest();

        // THEN
        expect(PermAuthorization.authorizeByPermissionMap).toHaveBeenCalledWith(new PermPermissionMap({
          only: undefined,
          except: ['USER'],
          redirectTo: undefined
        }));
      });

      it('should resolve multiple authorization calls properly', function () {
        // GIVEN
        var element = angular.element(
          '<div permission permission-only="\'ADMIN\'"></div>' +
          '<div permission permission-only="\'USER\'"></div>' +
          '<div permission permission-only="\'AUTHORIZED\'"></div>'
        );

        spyOn(PermAuthorization, 'authorizeByPermissionMap').and.callThrough();

        // WHEN
        $compile(element)($rootScope);
        $rootScope.$digest();

        // THEN
        expect(PermAuthorization.authorizeByPermissionMap).toHaveBeenCalledTimes(3);

        expect(PermAuthorization.authorizeByPermissionMap).toHaveBeenCalledWith(new PermPermissionMap({
          only: ['USER'],
          except: undefined,
          redirectTo: undefined
        }));

        expect(PermAuthorization.authorizeByPermissionMap).toHaveBeenCalledWith(new PermPermissionMap({
          only: ['ADMIN'],
          except: undefined,
          redirectTo: undefined
        }));

        expect(PermAuthorization.authorizeByPermissionMap).toHaveBeenCalledWith(new PermPermissionMap({
          only: ['AUTHORIZED'],
          except: undefined,
          redirectTo: undefined
        }));

        expect(angular.element(element[0]).hasClass('ng-hide')).toBeTruthy();
        expect(angular.element(element[1]).hasClass('ng-hide')).toBeFalsy();
        expect(angular.element(element[2]).hasClass('ng-hide')).toBeFalsy();
      });
    });
  });
});
