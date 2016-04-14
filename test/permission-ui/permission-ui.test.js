describe('module: permission.ui', function () {
  'use strict';

  var $rootScope;
  var $state;
  var $stateProvider;
  var PermissionStore;

  beforeEach(function () {
    module('ui.router', function ($injector) {
      $stateProvider = $injector.get('$stateProvider');
    });

    module('permission.ui', 'permission');

    inject(function ($injector) {
      $state = $injector.get('$state');
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
      });

    $state.go('home');
    $rootScope.$digest();
  });

  describe('event: $stateChangeStart', function () {
    it('should broadcast $stateChangePermissionStart event', inject(function ($rootScope) {
      // GIVEN
      var called = false;
      var toState = null;

      $rootScope.$on('$stateChangePermissionStart', function (event, _toState) {
        called = true;
        toState = _toState;
      });

      // WHEN
      $state.go('accepted');
      $rootScope.$digest();

      //THEN
      expect(called).toBeTruthy();
      expect(toState.name).toBe('accepted');
    }));

    it('should not authorize when $stateChangePermissionStart was prevented', function () {
      // GIVEN
      $rootScope.$on('$stateChangePermissionStart', function (event) {
        event.preventDefault();
      });
      
      spyOn($rootScope, '$broadcast').and.callThrough();

      // WHEN
      $state.go('accepted');
      $rootScope.$digest();

      // THEN
      expect($state.current.name).toBe('home');
      expect($rootScope.$broadcast).not.toHaveBeenCalledWith('$stateChangePermissionAccepted',
        jasmine.any(Object), jasmine.any(Object), jasmine.any(Object));
      expect($rootScope.$broadcast).not.toHaveBeenCalledWith('$stateChangePermissionDenied',
        jasmine.any(Object), jasmine.any(Object), jasmine.any(Object));
    });

    it('should broadcast $stateChangeStart event', function () {
      // GIVEN
      spyOn($rootScope, '$broadcast').and.callThrough();

      // WHEN
      $state.go('accepted');
      $rootScope.$digest();

      expect($rootScope.$broadcast).toHaveBeenCalledWith('$stateChangeStart',
        jasmine.any(Object), jasmine.any(Object),
        jasmine.any(Object), jasmine.any(Object),
        jasmine.any(Object));
    });

    it('should not authorize when $stateChangeStart has been prevented', function () {
      // GIVEN
      $rootScope.$on('$stateChangeStart', function (event) {
        event.preventDefault();
      });

      spyOn($rootScope, '$broadcast').and.callThrough();

      // WHEN
      $state.go('accepted');
      $rootScope.$digest();

      $state.go('denied');
      $rootScope.$digest();

      // THEN
      expect($state.current.name).toBe('home');
      // neither of them should have been called because the event was aborted manually
      expect($rootScope.$broadcast).not.toHaveBeenCalledWith('$stateChangePermissionAccepted',
        jasmine.any(Object), jasmine.any(Object), jasmine.any(Object));
      expect($rootScope.$broadcast).not.toHaveBeenCalledWith('$stateChangePermissionDenied',
        jasmine.any(Object), jasmine.any(Object), jasmine.any(Object));
    });
  });
});