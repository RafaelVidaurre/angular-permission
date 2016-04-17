describe('module: permission.ui', function () {
  'use strict';

  describe('authorization: StateAuthorization', function () {

    var $state;
    var $rootScope;
    var $stateProvider;
    var PermissionStore;
    var StateAuthorization;

    beforeEach(function () {
      module('ui.router', function ($injector) {
        $stateProvider = $injector.get('$stateProvider');
      });

      module('permission.ui');

      inject(function ($injector) {
        $state = $injector.get('$state');
        $rootScope = $injector.get('$rootScope');
        StateAuthorization = $injector.get('StateAuthorization');
        PermissionStore = $injector.get('PermissionStore');
      });
    });

    // Initialize permissions
    beforeEach(function () {
      PermissionStore.definePermission('accepted', function () {
        return true;
      });

      PermissionStore.definePermission('denied', function () {
        return false;
      });
    });

    // Set default states and go home
    beforeEach(function () {
      $stateProvider
        .state('home', {});

      $state.go('home');
      $rootScope.$apply();
    });

    describe('method: authorize', function () {
      it('should return resolved promise when "except" permissions are met', function () {
        // GIVEN
        $stateProvider
          .state('acceptedExcept', {
            data: {
              permissions: {
                except: ['denied']
              }
            }
          });

        // WHEN
        $state.go('acceptedExcept');
        $rootScope.$digest();

        // THEN
        expect($state.current.name).toBe('acceptedExcept');
      });

      it('should return rejected promise when "except" permissions are not met', function () {
        // GIVEN
        $stateProvider
          .state('deniedExcept', {
            data: {
              permissions: {
                except: ['accepted']
              }
            }
          });

        // WHEN
        $state.go('deniedExcept');
        $rootScope.$digest();

        // THEN
        expect($state.current.name).toBe('home');
      });

      it('should return resolved promise when "only" permissions are met', function () {
        // GIVEN
        $stateProvider
          .state('acceptedOnly', {
            data: {
              permissions: {
                only: ['accepted']
              }
            }
          });

        // WHEN
        $state.go('acceptedOnly');
        $rootScope.$digest();

        // THEN
        expect($state.current.name).toBe('acceptedOnly');
      });

      it('should return rejected promise when "only" permissions are not met', function () {
        // GIVEN
        $stateProvider
          .state('deniedOnly', {
            data: {
              permissions: {
                only: ['denied']
              }
            }
          });

        // WHEN
        $state.go('deniedOnly');
        $rootScope.$digest();

        // THEN
        expect($state.current.name).toBe('home');
      });

      it('should honor params and options passed to "transitionTo" or "go" function', function () {
        // GIVEN
        spyOn($state, 'go').and.callThrough();

        $stateProvider
          .state('acceptedWithParamsAndOptions', {
            params: {
              param: undefined
            },
            data: {
              permissions: {
                only: ['accepted']
              }
            }
          });

        // WHEN
        $state.go('acceptedWithParamsAndOptions', {param: 'param'}, {relative: true});
        $rootScope.$apply();

        // THEN
        expect($state.go).toHaveBeenCalledWith('acceptedWithParamsAndOptions', {param: 'param'}, {
          location: true,
          inherit: true,
          relative: true,
          notify: false,
          reload: false,
          $retry: false
        });
      });
    });
  });
});