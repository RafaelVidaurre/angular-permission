describe('Module: Permission', function () {
  'use strict';

  // TODO: Finish this test

  var $rootScope;
  var $state;
  var $stateProvider;
  var $q;
  var PermissionProvider;


  function $get(what) {
    return jasmine.getEnv().currentSpec.$injector.get(what);
  }

  function initStateTo(stateName, optionalParams) {
    var $state = $get('$state'), $rootScope = $get('$rootScope');
    $state.transitionTo(stateName, optionalParams || {});
    $rootScope.$digest();
    expect($state.current.name).toBe(stateName);
  }

  beforeEach(module('ui.router', function (_$stateProvider_) {
    $stateProvider = _$stateProvider_;
  }));

  beforeEach(module('permission', function (_PermissionProvider_) {
    PermissionProvider = _PermissionProvider_;
  }));

  beforeEach(inject(function(_$state_, _$q_, _$rootScope_) {
    $state = _$state_;
    $q = _$q_;
    $rootScope = _$rootScope_;
  }));

  beforeEach(function() {
    PermissionProvider.defineRole('accepted', function() {
      return true;
    });

    PermissionProvider.defineRole('denied', function() {
      return false;
    });

    PermissionProvider.defineRole('withParams', function(params) {
      return params.isset === 'true';
    });

    // for check all
    PermissionProvider.defineRole('resolve', function () {
      var deferred = $q.defer();
      deferred.resolve();
      return deferred.promise;
    });

    PermissionProvider.defineRole('reject', function () {
      var deferred = $q.defer();
      deferred.reject();
      return deferred.promise;
    });

    PermissionProvider.defineRole('reject-with-redirect', function () {
      var deferred = $q.defer();
      deferred.reject({redirectTo: 'redirectToAnotherState'});
      return deferred.promise;
    });

    PermissionProvider.defineRole('reject-with-reason', function () {
      var deferred = $q.defer();
      deferred.reject({reason: 'just cause'});
      return deferred.promise;
    }); 



    $stateProvider.state('home', {});
    $stateProvider.state('redirectToThisState', {});
    $stateProvider.state('redirectToAnotherState', {});


    $stateProvider.state('accepted', {
      data: {
      permissions: {
        only: ['accepted']
      }
      }
    });

    $stateProvider.state('denied', {
      data: {
      permissions: {
        only: ['denied']
      }
      }
    });

    $stateProvider.state('deniedWithRedirect', {
      data: {
      permissions: {
        only: ['denied'],
        redirectTo: 'redirectToThisState'
      }
      }
    });

    $stateProvider.state('onlyWithParams', {
      url: ':isset',
      data: {
        permissions: {
          only: ['withParams']
        }
      }
    });

    $stateProvider.state('exceptWithParams', {
      url: ':isset',
      data: {
        permissions: {
          except: ['withParams']
        }
      }
    });  

  });

  describe('On $stateChangeStart', function () {
    it('should go to an accepted state', inject (function($rootScope) {
      initStateTo('home');
      $state.go('accepted');

      var changePermissionAcceptedHasBeenCalled = false;
      $rootScope.$on('$stateChangePermissionAccepted', function () {
        changePermissionAcceptedHasBeenCalled = true;
      });

      var changePermissionDeniedHasBeenCalled = false;
      $rootScope.$on('$stateChangePermissionDenied', function () {
        changePermissionDeniedHasBeenCalled = true;
      });


      $rootScope.$digest();
      expect($state.current.name).toBe('accepted');
      expect(changePermissionAcceptedHasBeenCalled).toBeTruthy();
      expect(changePermissionDeniedHasBeenCalled).not.toBeTruthy();
    }));

    it('should not go to the denied state', function () {
      initStateTo('home');
      $state.go('denied');
      var changePermissionAcceptedHasBeenCalled = false;
      $rootScope.$on('$stateChangePermissionAccepted', function () {
        changePermissionAcceptedHasBeenCalled = true;
      });

      var changePermissionDeniedHasBeenCalled = false;
      $rootScope.$on('$stateChangePermissionDenied', function () {
        changePermissionDeniedHasBeenCalled = true;
      });

      $rootScope.$digest();
      expect($state.current.name).toBe('home');
      expect(changePermissionAcceptedHasBeenCalled).not.toBeTruthy();
      expect(changePermissionDeniedHasBeenCalled).toBeTruthy();
    });

    it('should not go to the denied state but redirect to the provided state', function () {
      initStateTo('home');
      $state.go('deniedWithRedirect');
      var changePermissionAcceptedHasBeenCalled = false;
      $rootScope.$on('$stateChangePermissionAccepted', function () {
        changePermissionAcceptedHasBeenCalled = true;
      });

      var changePermissionDeniedHasBeenCalled = false;
      $rootScope.$on('$stateChangePermissionDenied', function () {
        changePermissionDeniedHasBeenCalled = true;
      });
      $rootScope.$digest();
      expect($state.current.name).toBe('redirectToThisState');
      expect(changePermissionAcceptedHasBeenCalled).not.toBeTruthy();
      expect(changePermissionDeniedHasBeenCalled).toBeTruthy();
    });

    it('should pass state params (only)', function () {
      initStateTo('home');
      $state.go('onlyWithParams',{isset: true});
      var changePermissionAcceptedHasBeenCalled = false;
      $rootScope.$on('$stateChangePermissionAccepted', function () {
        changePermissionAcceptedHasBeenCalled = true;
      });

      var changePermissionDeniedHasBeenCalled = false;
      $rootScope.$on('$stateChangePermissionDenied', function () {
        changePermissionDeniedHasBeenCalled = true;
      });

      $rootScope.$digest();
      expect($state.current.name).toBe('onlyWithParams');
      expect(changePermissionAcceptedHasBeenCalled).toBeTruthy();
      expect(changePermissionDeniedHasBeenCalled).not.toBeTruthy();
    });

    it('should pass state params (except)', function () {
      initStateTo('home');
      $state.go('exceptWithParams',{isset: true});
      var changePermissionAcceptedHasBeenCalled = false;
      $rootScope.$on('$stateChangePermissionAccepted', function () {
        changePermissionAcceptedHasBeenCalled = true;
      });

      var changePermissionDeniedHasBeenCalled = false;
      $rootScope.$on('$stateChangePermissionDenied', function () {
        changePermissionDeniedHasBeenCalled = true;
      });

      $rootScope.$digest();
      expect($state.current.name).toBe('home');
      expect(changePermissionAcceptedHasBeenCalled).not.toBeTruthy();
      expect(changePermissionDeniedHasBeenCalled).toBeTruthy();
    });

    it('should not go to a accepted state when $stateChangeStart has been cancelled', function () {
      initStateTo('home');
      
      $rootScope.$on('$stateChangeStart', function (event) {
        event.preventDefault();
      });

      $state.go('accepted');
      var changePermissionAcceptedHasBeenCalled = false;
      $rootScope.$on('$stateChangePermissionAccepted', function () {
        changePermissionAcceptedHasBeenCalled = true;
      });

      var changePermissionDeniedHasBeenCalled = false;
      $rootScope.$on('$stateChangePermissionDenied', function () {
        changePermissionDeniedHasBeenCalled = true;
      });

      $rootScope.$digest();
      expect($state.current.name).toBe('home');
      // neither of them should have been called because the event was aborted manually
      expect(changePermissionAcceptedHasBeenCalled).not.toBeTruthy();
      expect(changePermissionDeniedHasBeenCalled).not.toBeTruthy();
    });

    it('should not go to a denied state when $stateChangeStart has been cancelled', function () {
      initStateTo('home');
      
      $rootScope.$on('$stateChangeStart', function (event) {
        event.preventDefault();
      });

      $state.go('denied');
      var changePermissionAcceptedHasBeenCalled = false;
      $rootScope.$on('$stateChangePermissionAccepted', function () {
        changePermissionAcceptedHasBeenCalled = true;
      });

      var changePermissionDeniedHasBeenCalled = false;
      $rootScope.$on('$stateChangePermissionDenied', function () {
        changePermissionDeniedHasBeenCalled = true;
      });

      $rootScope.$digest();
      expect($state.current.name).toBe('home');
      // neither of them should have been called because the event was aborted manually
      expect(changePermissionAcceptedHasBeenCalled).not.toBeTruthy();
      expect(changePermissionDeniedHasBeenCalled).not.toBeTruthy();
    });

  });

  describe('Permissions: check all with array', function () {
    it('should resolve if all roles are true or resolved', function () {
      $stateProvider.state('acceptCheckAllWithArray', {
        data: {
          permissions: {
            all: ['accepted', 'resolve']
          }
        }
      });

      initStateTo('home');
      $state.go('acceptCheckAllWithArray');

      $rootScope.$digest();

      expect($state.current.name).toBe('acceptCheckAllWithArray');
    });

    it('should not resolve if one role rejects', function () {
      $stateProvider.state('denyCheckAllWithArray', {
        data: {
          permissions: {
            all: ['accepted', 'reject']
          }
        }
      });

      initStateTo('home');
      $state.go('denyCheckAllWithArray');

      $rootScope.$digest();

      expect($state.current.name).toBe('home');
    });

    it('should not resolve if one role rejects but go to the redirectTo state if provided by the redirecTo property', function () {
      $stateProvider.state('denyCheckAllWithArrayAndRedirect', {
        data: {
          permissions: {
            all: ['accepted', 'reject'],
            redirectTo: 'redirectToThisState'
          }
        }
      });

      initStateTo('home');
      $state.go('denyCheckAllWithArrayAndRedirect');

      $rootScope.$digest();

      expect($state.current.name).toBe('redirectToThisState');
    });


    it('should not resolve if one role rejects but go to the redirectTo state if provided by the rejecting role and favor this redirection over the one in the state', function () {
      $stateProvider.state('denyCheckAllWithArrayAndRedirectInRejection', {
        data: {
          permissions: {
            all: ['accepted', 'reject-with-redirect'],
            redirectTo: 'redirectToThisState'
          }
        }
      });

      initStateTo('home');
      $state.go('denyCheckAllWithArrayAndRedirectInRejection');

      $rootScope.$digest();

      expect($state.current.name).toBe('redirectToAnotherState');
    });


    it('should not resolve if one role rejects but go to the redirectTo state provided in the configured state although a reason was provided with the rejection', function () {
      $stateProvider.state('denyCheckAllWithArrayAndNoRedirectInRejection', {
        data: {
          permissions: {
            all: ['accepted', 'reject-with-reason'],
            redirectTo: 'redirectToThisState'
          }
        }
      });

      initStateTo('home');
      $state.go('denyCheckAllWithArrayAndNoRedirectInRejection');

      $rootScope.$digest();

      expect($state.current.name).toBe('redirectToThisState');
    });
  });

  describe('Permissions: check all with object', function () {
    it('should resolve if all roles are true or resolved', function () {
      $stateProvider.state('acceptCheckAllWithObject', {
        data: {
          permissions: {
            all: {
              accepted: {},
              resolve: {}
            }
          }
        }
      });

      initStateTo('home');
      $state.go('acceptCheckAllWithObject');

      $rootScope.$digest();

      expect($state.current.name).toBe('acceptCheckAllWithObject');
    });
  
    it('should reject if one of the roles is false or rejects', function () {
      $stateProvider.state('denyCheckAllWithObject', {
        data: {
          permissions: {
            all: {
              accepted: {},
              reject: {}
            }
          }
        }
      });

      initStateTo('home');
      $state.go('denyCheckAllWithObject');

      $rootScope.$digest();

      expect($state.current.name).toBe('home');
    });

    it('should reject if one of the roles is false or rejects and redirect to the redirectTo state', function () {
      $stateProvider.state('denyCheckAllWithObjectButRedirect', {
        data: {
          permissions: {
            all: {
              accepted: {},
              reject: {}
            },
            redirectTo: 'redirectToThisState'
          }
        }
      });       

      initStateTo('home');
      $state.go('denyCheckAllWithObjectButRedirect');

      $rootScope.$digest();

      expect($state.current.name).toBe('redirectToThisState');
    });    

    it('should reject if one of the roles is false or rejects and redirect to the redirectTo state from the role and favor it over the redirectTo from the state', function () {
      $stateProvider.state('denyCheckAllWithObjectButRedirectInRole', {
        data: {
          permissions: {
            all: {
              accepted: {},
              reject: {
                redirectTo: 'redirectToAnotherState'
              }
            },
            redirectTo: 'redirectToThisState'
          }
        }
      });          

      initStateTo('home');
      $state.go('denyCheckAllWithObjectButRedirectInRole');

      $rootScope.$digest();

      expect($state.current.name).toBe('redirectToAnotherState');
    });    


    it('should reject if one of the roles is false or rejects and redirect to the redirectTo state from the roles rejection function and favor it over the redirectTo from the state and over the redirectTo setting from the role in the stateProvider config', function () {
      $stateProvider.state('denyCheckAllWithObjectButRedirectInRolesRejectFunction', {
        data: {
          permissions: {
            all: {
              accepted: {},
              'reject-with-redirect': {
                redirectTo: 'redirectToAnotherState'
              }
            },
            redirectTo: 'redirectToThisState'
          }
        }
      });       

      initStateTo('home');
      $state.go('denyCheckAllWithObjectButRedirectInRolesRejectFunction');

      $rootScope.$digest();

      expect($state.current.name).toBe('redirectToAnotherState');
    });    

    it('should reject if one of the roles is false or rejects and redirect to the redirectTo state from the state\'s redirectTo although the rejection reason was not empty', function () {
      $stateProvider.state('denyCheckAllWithObjectButRedirectAlthoughNonsenseInRejectFunction', {
          data: {
            permissions: {
              all: {
                accepted: {},
                'reject-with-reason': {
                  redirectTo: 'redirectToAnotherState'
                }
              },
              redirectTo: 'redirectToThisState'
            }
          }
      });  

      initStateTo('home');
      $state.go('denyCheckAllWithObjectButRedirectAlthoughNonsenseInRejectFunction');

      $rootScope.$digest();

      expect($state.current.name).toBe('redirectToAnotherState');
    });    
    
  
  });

});
