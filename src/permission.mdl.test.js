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
      if(params.isset && angular.isString(params.isset)) {
        return params.isset === 'true';
      }
      else {
        return params.isset === true;
      }
    });


    $stateProvider.state('home', {});
    $stateProvider.state('redirectToThisState', {});


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

});
