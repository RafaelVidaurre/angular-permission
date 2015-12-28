describe('service: Authorization', function () {
  'use strict';

  var $q, $rootScope, PermissionStore, Authorization;

  beforeEach(function () {
    module('permission');

    inject(function ($injector) {
      PermissionStore = $injector.get('PermissionStore');
      Authorization = $injector.get('Authorization');
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');
    });
  });

  describe('method: authorize', function () {

    var isResolved;

    beforeEach(function () {
      PermissionStore.definePermission('user', function () {
        return true;
      });

      isResolved = false;
    });

    it('should resolve promise when "only" matches permissions', function () {
      // GIVEN
      Authorization
        .authorize({only: ['user']}, null)
        .then(function () {
          isResolved = true;
        });

      // WHEN
      $rootScope.$apply();

      // THEN
      expect(isResolved).toEqual(true);
    });

    it('should reject promise when "only" mismatches permissions', function () {
      // GIVEN
      Authorization
        .authorize({only: ['admin']}, null)
        .catch(function () {
          isResolved = true;
        });

      // WHEN
      $rootScope.$apply();

      // THEN
      expect(isResolved).toEqual(true);
    });

    it('should resolve promise when "except" mismatches permissions', function () {
      // GIVEN
      Authorization
        .authorize({except: ['admin']}, null)
        .then(function () {
          isResolved = true;
        });

      // WHEN
      $rootScope.$apply();

      // THEN
      expect(isResolved).toEqual(true);
    });

    it('should reject promise when "except" matches permissions', function () {
      // GIVEN
      Authorization
        .authorize({except: ['user']}, null)
        .catch(function () {
          isResolved = true;
        });

      // WHEN
      $rootScope.$apply();

      // THEN
      expect(isResolved).toEqual(true);
    });
  });
});