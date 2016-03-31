describe('decorator: $q', function () {
  'use strict';

  var $q, $rootScope, $timeout;

  beforeEach(function () {
    module('permission');

    inject(function ($injector) {
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');
      $timeout = $injector.get('$timeout');
    });
  });

  describe('method: any', function () {
    it('should reject empty promise array', function () {
      // GIVEN
      var isCalled = false;

      // WHEN
      $q.any([])
        .catch(function () {
          isCalled = true;
        });

      $rootScope.$apply();

      // THEN
      expect(isCalled).toBeTruthy();
    });

    it('should take an array of promises and return a value of the first resolved promise', function () {
      // GIVEN
      var result = null;
      var promise1 = $q.resolve(1);
      var promise2 = $q.resolve(2);
      var promise3 = $q.reject(3);

      // WHEN
      $q.any([promise1, promise2, promise3])
        .then(function (res) {
          result = res;
        });

      $rootScope.$apply();

      // THEN
      expect(result).toBe(1);
      expect(result).not.toBe(2);
      expect(result).not.toBe(3);
    });

    it('should reject the derived promise if none of the promises in the array is resolved', function () {
      // GIVEN
      var result = null;
      var promise1 = $q.reject('1');
      var promise2 = $q.reject('2');
      var promise3 = $q.reject('3');

      // WHEN
      $q.any([promise1, promise2, promise3])
        .catch(function (res) {
          result = res;
        });

      $rootScope.$apply();

      // THEN
      expect(result).toEqual('3');
    });
  });
});