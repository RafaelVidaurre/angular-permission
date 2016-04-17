describe('module: permission.ui', function () {
  'use strict';

  describe('authorization: StatePermissionMap', function () {

    var $rootScope;
    var $state;
    var $stateProvider;
    var PermissionStore;
    var StatePermissionMap;
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
        StatePermissionMap = $injector.get('StatePermissionMap');
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

    describe('method: constructor', function () {
      it('should build PermissionMap including parent states permissions', function () {
        // GIVEN
        $stateProvider
          .state('home', {})
          .state('accepted', {
            data: {
              permissions: {
                only: ['accepted']
              }
            }
          })
          .state('denied', {
            data: {
              permissions: {
                only: ['denied']
              }
            }
          })
          .state('compensated', {
            data: {
              permissions: {
                only: ['accepted'],
                except: ['denied']
              }
            }
          })
          .state('compensated.child', {
            data: {
              permissions: {
                only: ['acceptedChild'],
                except: ['deniedChild']
              }
            }
          });


        PermissionStore.definePermission('acceptedChild', function () {
          return true;
        });

        PermissionStore.definePermission('deniedChild', function () {
          return false;
        });

        spyOn(StateAuthorization, 'authorize').and.callThrough();

        // WHEN
        $state.go('home');
        $rootScope.$digest();

        $state.go('compensated.child');
        $rootScope.$digest();

        // THEN
        expect(StateAuthorization.authorize).toHaveBeenCalledWith(new StatePermissionMap({
          only: [['acceptedChild'], ['accepted']],
          except: [['deniedChild'], ['denied']],
          redirectTo: undefined
        }));
      });
    });


  });
});