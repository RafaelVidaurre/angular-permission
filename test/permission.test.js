describe('module: Permission', function () {
  'use strict';

  var $rootScope;
  var $state;
  var $stateProvider;
  var PermissionStore;

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
      $rootScope.$apply();

      //THEN
      expect(called).toBeTruthy();
      expect(toState.name).toBe('accepted');
    }));

    it('should not authorize when $stateChangePermissionStart was prevented', function () {
      // GIVEN
      $rootScope.$on('$stateChangePermissionStart', function (event) {
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

    it('should broadcast $stateChangeStart event', function () {
      // GIVEN
      var called = false;

      $rootScope.$on('$stateChangeStart', function () {
        called = true;
      });

      // WHEN
      $state.go('accepted');
      $rootScope.$apply();

      expect(called).toBeTruthy();
    });

    it('should not authorize when $stateChangeStart has been prevented', function () {
      // GIVEN
      $rootScope.$on('$stateChangeStart', function (event) {
        event.preventDefault();
      });

      // WHEN
      $state.go('accepted');
      $rootScope.$apply();


      $state.go('denied');
      $rootScope.$apply();

      // THEN
      expect($state.current.name).toBe('home');
      // neither of them should have been called because the event was aborted manually
      expect(changePermissionAcceptedHasBeenCalled).not.toBeTruthy();
      expect(changePermissionDeniedHasBeenCalled).not.toBeTruthy();
    });
  });
});