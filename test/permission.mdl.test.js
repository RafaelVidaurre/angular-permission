describe('module: Permission', function () {
  'use strict';

  var $rootScope, $state, $stateProvider, $q, $exceptionHandler, PermissionProvider;

  beforeEach(function () {
    module('ui.router', function ($injector) {
      $stateProvider = $injector.get('$stateProvider');
    });

    module('permission', function ($injector) {
      PermissionProvider = $injector.get('PermissionProvider');
    });

    inject(function ($injector) {
      $state = $injector.get('$state');
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');
      $exceptionHandler = $injector.get('$exceptionHandler');
    });
  });

  // Initialize permissions
  beforeEach(function () {
    PermissionProvider.setPermission('accepted', function () {
      return true;
    });

    PermissionProvider.setPermission('denied', function () {
      return false;
    });

    PermissionProvider.setPermission('withParams', function (params) {
      if (params.isSet && angular.isString(params.isSet)) {
        return params.isSet === 'true';
      }
      else {
        return params.isSet === true;
      }
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

  var changePermissionAcceptedHasBeenCalled, changePermissionDeniedHasBeenCalled;

  // Bind event listeners
  beforeEach(function () {
    changePermissionAcceptedHasBeenCalled = false;
    changePermissionDeniedHasBeenCalled = false;

    $rootScope.$on('$stateChangePermissionAccepted', function () {
      changePermissionAcceptedHasBeenCalled = true;
    });

    $rootScope.$on('$stateChangePermissionDenied', function () {
      changePermissionDeniedHasBeenCalled = true;
    });
  });

  describe('event: $stateChangeStart', function () {
    it('should go to an accepted state', function () {
      // GIVEN
      // WHEN
      $state.go('accepted');
      $rootScope.$apply();

      // THEN
      expect($state.current.name).toBe('accepted');
      expect(changePermissionAcceptedHasBeenCalled).toBeTruthy();
      expect(changePermissionDeniedHasBeenCalled).not.toBeTruthy();
    });

    it('should broadcast a $stateChangeStart with correct parameters (accepted state)', function () {
      // GIVEN
      var called = false;
      var toState = null;
      var fromState = null;

      $rootScope.$on('$stateChangeStart', function (event, _toState, toParams, _fromState) {
        called = true;
        toState = _toState;
        fromState = _fromState;
      });

      // WHEN
      $state.go('accepted');
      $rootScope.$apply();

      expect(called).toBeTruthy();
      expect(toState.name).toBe('accepted');
      expect(fromState.name).toBe('home');
    });

    it('should broadcast a $stateChangePermissionStart', inject(function ($rootScope) {
      // GIVEN
      var called = false;
      var toState = null;

      $rootScope.$on('$stateChangePermissionStart', function (event, _toState) {
        called = true;
        toState = _toState;
      });

      // WHEN
      $state.go('accepted');
      $rootScope.$apply();

      //THEN
      expect(called).toBeTruthy();
      expect(toState.name).toBe('accepted');
    }));

    it('should not go to a state when $stateChangePermissionStart has been cancelled', function () {
      // GIVEN
      $rootScope.$on('$stateChangePermissionStart', function (event) {
        //noinspection JSUnresolvedFunction
        event.preventDefault();
      });

      // WHEN
      $state.go('accepted');
      $rootScope.$apply();

      // THEN
      expect($state.current.name).toBe('home');
      expect(changePermissionAcceptedHasBeenCalled).not.toBeTruthy();
      expect(changePermissionDeniedHasBeenCalled).not.toBeTruthy();
    });

    it('should not go to the denied state', function () {
      // GIVEN
      // WHEN
      $state.go('denied');
      $rootScope.$digest();

      // THEN
      expect($state.current.name).toBe('home');
      expect(changePermissionAcceptedHasBeenCalled).not.toBeTruthy();
      expect(changePermissionDeniedHasBeenCalled).toBeTruthy();
    });

    it('should go to child state if parent permissions are resolved', function () {
      // GIVEN
      $stateProvider.state('accepted.acceptedChild', {});

      // WHEN
      $state.go('accepted.acceptedChild');
      $rootScope.$digest();

      // THEN
      expect($state.current.name).toBe('accepted.acceptedChild');
      expect(changePermissionAcceptedHasBeenCalled).toBeTruthy();
      expect(changePermissionDeniedHasBeenCalled).not.toBeTruthy();
    });

    it('should not go to child state if parent permissions are rejected', function () {
      // GIVEN
      $stateProvider.state('denied.deniedChild', {});

      // WHEN
      $state.go('denied.deniedChild');
      $rootScope.$digest();

      // THEN
      expect($state.current.name).toBe('home');
      expect(changePermissionAcceptedHasBeenCalled).not.toBeTruthy();
      expect(changePermissionDeniedHasBeenCalled).toBeTruthy();
    });

    it('should broadcast a $stateChangeStart with correct parameters (denied state)', inject(function ($rootScope) {
      // GIVEN
      var called = false;
      var toState = null;
      var fromState = null;

      $rootScope.$on('$stateChangeStart', function (event, _toState, toParams, _fromState) {
        called = true;
        toState = _toState;
        fromState = _fromState;
      });

      // WHEN
      $state.go('denied');
      $rootScope.$apply();

      // THEN
      expect($state.current.name).toBe('home');
      expect(called).toBeTruthy();
      expect(toState.name).toBe('denied');
      expect(fromState.name).toBe('home');
    }));

    it('should not go to the denied state but redirect to the provided state', function () {
      // GIVEN
      $stateProvider
        .state('redirectToThisState', {})
        .state('deniedWithRedirect', {
          data: {
            permissions: {
              only: ['denied'],
              redirectTo: 'redirectToThisState'
            }
          }
        });

      // WHEN
      $state.go('deniedWithRedirect');
      $rootScope.$digest();

      // THEN
      expect($state.current.name).toBe('redirectToThisState');
      expect(changePermissionAcceptedHasBeenCalled).not.toBeTruthy();
      expect(changePermissionDeniedHasBeenCalled).toBeTruthy();
    });

    it('should trigger $stateChangeSuccess with the redirect state and not the denied one', function () {
      // GIVEN
      var toState = null;

      $stateProvider
        .state('redirectToThisState', {})
        .state('deniedWithRedirect', {
          data: {
            permissions: {
              only: ['denied'],
              redirectTo: 'redirectToThisState'
            }
          }
        });

      $rootScope.$on('$stateChangeSuccess', function (name, _toState) {
        toState = _toState;
      });

      // WHEN
      $state.go('deniedWithRedirect');
      $rootScope.$apply();

      // THEN
      expect(toState.name).not.toBe('deniedWithRedirect');
      expect(toState.name).toBe('redirectToThisState');
    });

    it('should pass state params on redirect', function () {
      // GIVEN
      $stateProvider
        .state('abstractTest', {
          abstract: true,
          url: ':abstractValue'
        })
        .state('abstractTest.redirect', {
          url: '/abstract'
        })
        .state('abstractTest.denied', {
          url: '/denied',
          data: {
            permissions: {
              only: ['denied'],
              redirectTo: 'abstractTest.redirect'
            }
          }
        });

      // WHEN
      $state.go('abstractTest.denied', {abstractValue: 'test'});
      $rootScope.$apply();

      // THEN
      expect($state.current.name).toBe('abstractTest.redirect');
      expect($state.params.abstractValue).toBe('test');
      expect(changePermissionAcceptedHasBeenCalled).not.toBeTruthy();
      expect(changePermissionDeniedHasBeenCalled).toBeTruthy();
    });

    it('should pass state params (only)', function () {
      // GIVEN
      $stateProvider.state('onlyWithParams', {
        url: ':isSet',
        data: {
          permissions: {
            only: ['withParams']
          }
        }
      });

      // WHEN
      $state.go('onlyWithParams', {isSet: true});
      $rootScope.$apply();

      // THEN
      expect($state.current.name).toBe('onlyWithParams');
      expect(changePermissionAcceptedHasBeenCalled).toBeTruthy();
      expect(changePermissionDeniedHasBeenCalled).not.toBeTruthy();
    });

    it('should pass state params (except)', function () {
      // GIVEN
      $stateProvider.state('exceptWithParams', {
        url: ':isSet',
        data: {
          permissions: {
            except: ['withParams']
          }
        }
      });

      // WHEN
      $state.go('exceptWithParams', {isSet: true});
      $rootScope.$apply();

      // THEN
      expect($state.current.name).toBe('home');
      expect(changePermissionAcceptedHasBeenCalled).not.toBeTruthy();
      expect(changePermissionDeniedHasBeenCalled).toBeTruthy();
    });

    it('should not go to a accepted state when $stateChangeStart has been cancelled', function () {
      // GIVEN
      $rootScope.$on('$stateChangeStart', function (event) {
        //noinspection JSUnresolvedFunction
        event.preventDefault();
      });

      // WHEN
      $state.go('accepted');
      $rootScope.$apply();

      // THEN
      expect($state.current.name).toBe('home');
      // neither of them should have been called because the event was aborted manually
      expect(changePermissionAcceptedHasBeenCalled).not.toBeTruthy();
      expect(changePermissionDeniedHasBeenCalled).not.toBeTruthy();
    });

    it('should not go to a denied state when $stateChangeStart has been cancelled', function () {
      // GIVEN
      $rootScope.$on('$stateChangeStart', function (event) {
        //noinspection JSUnresolvedFunction
        event.preventDefault();
      });

      // WHEN
      $state.go('denied');
      $rootScope.$apply();

      // THEN
      expect($state.current.name).toBe('home');
      // neither of them should have been called because the event was aborted manually
      expect(changePermissionAcceptedHasBeenCalled).not.toBeTruthy();
      expect(changePermissionDeniedHasBeenCalled).not.toBeTruthy();
    });
  });

  describe('param: redirectTo', function () {
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
                  denied: function(){
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
                  denied: function(){
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
  });
});