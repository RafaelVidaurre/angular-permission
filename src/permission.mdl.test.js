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
  });

  describe('On $stateChangeStart', function () {
    it('should go to an accepted state', inject (function($rootScope) {
      initStateTo('home');
      $state.go('accepted');
      spyOn($rootScope, '$broadcast');

      $rootScope.$digest();
      expect($state.current.name).toBe('accepted');
      expect($rootScope.$broadcast).toHaveBeenCalledWith('$stateChangePermissionAccepted');
      expect($rootScope.$broadcast).not.toHaveBeenCalledWith('$stateChangePermissionDenied');
    }));

    it('should not go to the denied state', function () {
      initStateTo('home');
      $state.go('denied');
      spyOn($rootScope, '$broadcast');


      $rootScope.$digest();
      expect($state.current.name).toBe('home');
      expect($rootScope.$broadcast).not.toHaveBeenCalledWith('$stateChangePermissionAccepted');
      expect($rootScope.$broadcast).toHaveBeenCalledWith('$stateChangePermissionDenied');
    });

    it('should not go to the denied state but redirect to the provided state', function () {
      initStateTo('home');
      $state.go('deniedWithRedirect');
      spyOn($rootScope, '$broadcast');

      $rootScope.$digest();
      expect($state.current.name).toBe('redirectToThisState');
      expect($rootScope.$broadcast).not.toHaveBeenCalledWith('$stateChangePermissionAccepted');
      expect($rootScope.$broadcast).toHaveBeenCalledWith('$stateChangePermissionDenied');
    });

  });

});
