describe('model: PermissionMap', function () {
  'use strict';

  var $rootScope, $state, $stateProvider, $q, PermissionStore;

  beforeEach(function () {
    module('ui.router', function ($injector) {
      $stateProvider = $injector.get('$stateProvider');
    });

    module('permission');

    inject(function ($injector) {
      $state = $injector.get('$state');
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');
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
      .state('home', {})
      .state('accepted', {
        data: {
          permissions: {only: ['accepted']}
        }
      })
      .state('denied', {
        data: {
          permissions: {
            only: ['denied']
          }
        }
      });

    $state.go('home');
    $rootScope.$apply();
  });

  describe('param: redirectTo', function () {

    describe('used as string', function () {
      it('should redirect based on state name', function () {
        // GIVEN
        $stateProvider
          .state('redirected', {})
          .state('redirect', {
            data: {
              permissions: {
                only: ['denied'],
                redirectTo: 'redirected'
              }
            }
          });

        // WHEN
        $state.go('redirect');
        $rootScope.$digest();

        // THEN
        expect($state.current.name).toBe('redirected');
      });
    });

    describe('used as object', function () {
      it('should throw error when "default" property is not defined', function () {
        // GIVEN
        var error;

        $stateProvider
          .state('redirect', {
            data: {
              permissions: {
                only: ['denied'],
                redirectTo: {}
              }
            }
          });

        // WHEN
        $state.go('redirect');
        try {
          $rootScope.$apply();
        } catch (err) {
          error = err;
        }

        // THEN
        expect(error.message).toBe('When used "redirectTo" as object, property "default" must be defined');
      });

      it('should redirect to "default" property value if rejected permission is not found', function () {
        // GIVEN
        $stateProvider
          .state('redirect', {
            data: {
              permissions: {
                only: ['denied'],
                redirectTo: {
                  otherThanDenied: 'otherThanDenied',
                  default: 'default'
                }
              }
            }
          })
          .state('default', {})
          .state('otherThanDenied', {});

        // WHEN
        $state.go('redirect');
        $rootScope.$apply();

        // THEN
        expect($state.current.name).toBe('default');
        expect($state.current.name).not.toBe('otherThanDenied');
      });

      it('should redirect based on results of rejected permission with string property', function () {
        // GIVEN
        $stateProvider
          .state('redirect', {
            data: {
              permissions: {
                only: ['denied'],
                redirectTo: {
                  denied: 'redirected',
                  default: 'default'
                }
              }
            }
          })
          .state('default', {})
          .state('redirected', {});

        // WHEN
        $state.go('redirect');
        $rootScope.$apply();

        // THEN
        expect($state.current.name).toBe('redirected');
        expect($state.current.name).not.toBe('default');
      });

      it('should redirect based on results of rejected permission with function', function () {
        // GIVEN
        $stateProvider
          .state('redirect', {
            data: {
              permissions: {
                only: ['denied'],
                redirectTo: {
                  denied: function () {
                    return 'redirected';
                  },
                  default: 'default'
                }
              }
            }
          })
          .state('default', {})
          .state('redirected', {});

        // WHEN
        $state.go('redirect');
        $rootScope.$apply();

        // THEN
        expect($state.current.name).toBe('redirected');
        expect($state.current.name).not.toBe('default');
      });

      it('should redirect based on results of rejected permission with promise', function () {
        // GIVEN
        $stateProvider
          .state('redirect', {
            data: {
              permissions: {
                only: ['denied'],
                redirectTo: {
                  denied: function () {
                    return $q.when('redirected');
                  },
                  default: 'default'
                }
              }
            }
          })
          .state('default', {})
          .state('redirected', {});

        // WHEN
        $state.go('redirect');
        $rootScope.$apply();

        // THEN
        expect($state.current.name).toBe('redirected');
        expect($state.current.name).not.toBe('default');
      });
    });

    describe('used as function/promise', function () {
      it('should throw error when function do not return state string', function () {
        // GIVEN
        var error;

        $stateProvider
          .state('redirect', {
            url: '/function',
            data: {
              permissions: {
                only: ['denied'],
                redirectTo: function () {
                  return null;
                }
              }
            }
          });

        // WHEN
        $state.go('redirect');
        try {
          $rootScope.$apply();
        } catch (err) {
          error = err;
        }

        // THEN
        expect(error.message).toBe('When used "redirectTo" as function, returned value must be string with state name');
      });

      it('should redirect based on results of function', function () {
        // GIVEN
        $stateProvider
          .state('redirect', {
            data: {
              permissions: {
                only: ['denied'],
                redirectTo: function () {
                  return 'other';
                }
              }
            }
          })
          .state('other', {});

        // WHEN
        $state.go('redirect');
        $rootScope.$apply();

        // THEN
        expect($state.current.name).toBe('other');
      });

      it('should redirect with promise based functions', function () {
        // GIVEN
        $stateProvider.state('redirect', {
            data: {
              permissions: {
                only: ['denied'],
                redirectTo: function () {
                  return $q.when('other');
                }
              }
            }
          })
          .state('other', {
            url: '/other'
          });

        // WHEN
        $state.go('redirect');
        $rootScope.$apply();

        // THEN
        expect($state.current.name).toBe('other');
      });
    });
  });
});