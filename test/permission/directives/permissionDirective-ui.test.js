describe('permission.ui', function () {
  'use strict';

  describe('directives', function () {
    describe('directive: Permission', function () {

      var $compile;
      var $rootScope;
      var $stateProvider;
      var permRoleStore;

      beforeEach(function () {
        // Instantiate module
        module('permission');
        module('permission.ui');

        module('ui.router', function ($injector) {
          $stateProvider = $injector.get('$stateProvider');
        });

        installPromiseMatchers(); // jshint ignore:line

        // Inject services into module
        inject(function ($injector) {
          $compile = $injector.get('$compile');
          $rootScope = $injector.get('$rootScope').$new();
          permRoleStore = $injector.get('permRoleStore');
        });
      });

      // Initialize permissions
      beforeEach(function () {
        permRoleStore.defineRole('USER', function () {
          return true;
        });

        permRoleStore.defineRole('AUTHORIZED', function () {
          return true;
        });

        permRoleStore.defineRole('ADMIN', function () {
          return false;
        });
      });

      it('should show element if authorized when permissions are passed as state reference', function () {
        // GIVEN
        $stateProvider
          .state('parent', {
            data: {
              permissions: {
                only: ['AUTHORIZED']
              }
            }
          })
          .state('accepted', {
            parent: 'parent',
            data: {
              permissions: {
                only: ['USER']
              }
            }
          });

        var element = angular.element('<div permission permission-sref="\'accepted\'"></div>');

        // WHEN
        $compile(element)($rootScope);
        $rootScope.$digest();

        // THEN
        expect(element.hasClass('ng-hide')).toBeFalsy();
      });

      it('should hide element if unauthorized due to parent state restrictions when permissions are passed as state reference', function () {
        // GIVEN
        $stateProvider
          .state('parent', {
            data: {
              permissions: {
                only: ['ADMIN']
              }
            }
          })
          .state('accepted', {
            parent: 'parent',
            data: {
              permissions: {
                only: ['USER']
              }
            }
          });

        var element = angular.element('<div permission permission-sref="\'accepted\'"></div>');

        // WHEN
        $compile(element)($rootScope);
        $rootScope.$digest();

        // THEN
        expect(element.hasClass('ng-hide')).toBeTruthy();
      });
    });
  });
});