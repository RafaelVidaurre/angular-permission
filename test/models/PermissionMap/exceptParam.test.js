describe('model: PermissionMap', function () {
  'use strict';

  var $rootScope, $state, $stateProvider, PermissionStore;

  beforeEach(function () {
    module('ui.router', function ($injector) {
      $stateProvider = $injector.get('$stateProvider');
    });

    module('permission');

    inject(function ($injector) {
      $state = $injector.get('$state');
      $rootScope = $injector.get('$rootScope');
      PermissionStore = $injector.get('PermissionStore');
    });
  });

  // Initialize permissions
  beforeEach(function () {
    PermissionStore.definePermission('AUTHORIZED', function () {
      return true;
    });

    PermissionStore.definePermission('ADMIN', function () {
      return false;
    });

    PermissionStore.definePermission('UNAUTHORIZED', function () {
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

  describe('param: except', function () {

    function authorizationTests() {
      it('should go to state if authorized', function () {
        // GIVEN
        // WHEN
        $state.go('authorized');
        $rootScope.$digest();

        // THEN
        expect($state.current.name).toBe('authorized');
      });

      it('should go to child state if parent state is authorized', function () {
        // GIVEN
        $stateProvider.state('authorized.child', {});

        // WHEN
        $state.go('authorized.child');
        $rootScope.$digest();

        // THEN
        expect($state.current.name).toBe('authorized.child');
      });

      it('should go to authorized state even if called multiple time', function () {
        // GIVEN
        $stateProvider.state('authorized.child', {});

        // WHEN
        $state.go('authorized.child');
        $rootScope.$digest();
        $state.go('authorized.child');
        $rootScope.$digest();

        // THEN
        expect($state.current.name).toBe('authorized.child');
      });

      it('should not go to state if unauthorized', function () {
        // GIVEN
        // WHEN
        $state.go('unauthorized');
        $rootScope.$digest();

        // THEN
        expect($state.current.name).toBe('home');
      });

      it('should not go to child state if parent state is not authorized', function () {
        // GIVEN
        $stateProvider.state('unauthorized.child', {});


        // WHEN
        $state.go('unauthorized.child');
        $rootScope.$digest();

        // THEN
        expect($state.current.name).toBe('home');
      });

      it('should not go to unauthorized state even if accessed multiple times', function () {
        // GIVEN
        $stateProvider.state('unauthorized.child', {});


        // WHEN
        $state.go('unauthorized.child');
        $rootScope.$digest();
        $state.go('unauthorized.child');
        $rootScope.$digest();

        // THEN
        expect($state.current.name).toBe('home');
      });
    }

    describe('used as string', function () {
      beforeEach(function () {
        $stateProvider
          .state('authorized', {
            data: {
              permissions: {
                except: 'UNAUTHORIZED'
              }
            }
          })
          .state('unauthorized', {
            data: {
              permissions: {
                except: 'AUTHORIZED'
              }
            }
          });
      });

      authorizationTests();
    });

    describe('used as array', function () {
      beforeEach(function () {
        $stateProvider
          .state('authorized', {
            data: {
              permissions: {
                except: ['UNAUTHORIZED', 'ADMIN']
              }
            }
          })
          .state('unauthorized', {
            data: {
              permissions: {
                except: ['AUTHORIZED']
              }
            }
          });
      });

      authorizationTests();
    });

    describe('used as function', function () {
      beforeEach(function () {
        $stateProvider
          .state('authorized', {
            data: {
              permissions: {
                except: function () {
                  return ['UNAUTHORIZED', 'ADMIN'];
                }
              }
            }
          })
          .state('unauthorized', {
            data: {
              permissions: {
                except: function () {
                  return ['AUTHORIZED'];
                }
              }
            }
          });
      });

      authorizationTests();
    });
  });
});