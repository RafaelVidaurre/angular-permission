describe('decorator: $q', function () {
  'use strict';

  var $q;

  beforeEach(function () {
    module('permission');

    installPromiseMatchers(); // jshint ignore:line

    inject(function ($injector) {
      $q = $injector.get('$q');
    });
  });

  describe('method: any', function () {
    it('should reject empty promise array', function () {
      // GIVEN
      // WHEN
      var promise = $q.any([]);

      // THEN
      expect(promise).toBeRejected();
    });

    it('should take an array of promises and return a value of the first resolved promise', function () {
      // GIVEN
      var promise1 = $q.resolve(1);
      var promise2 = $q.resolve(2);
      var promise3 = $q.reject(3);

      // WHEN
      var promise = $q.any([promise1, promise2, promise3]);

      // THEN
      expect(promise).toBeResolvedWith(1);
      expect(promise).not.toBeResolvedWith(2);
      expect(promise).not.toBeResolvedWith(3);
    });

    it('should reject the derived promise if none of the promises in the array is resolved', function () {
      // GIVEN
      var promise1 = $q.reject(1);
      var promise2 = $q.reject(2);
      var promise3 = $q.reject(3);

      // WHEN
      var promise = $q.any([promise1, promise2, promise3]);

      // THEN
      expect(promise).toBeRejectedWith(3);
    });
  });
});