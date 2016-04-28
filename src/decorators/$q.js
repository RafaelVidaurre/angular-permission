(function () {
  'use strict';

  /**
   * Extends $q implementation by A+ *any* method
   * @name $q
   * @extends {angular.$q}
   * @memberOf permission
   *
   * @param $delegate {Object} Angular promise implementation
   */
  function $q($delegate) {
    'ngInject';

    $delegate.any = any;

    /**
     * Implementation of missing $q `any` method that wits for first resolution of provided promise set
     * @method
     *
     * @param promises {Array|promise} Single or set of promises
     *
     * @returns {Promise} Returns a single promise that will be rejected with an array/hash of values,
     *  each value corresponding to the promise at the same index/key in the `promises` array/hash.
     *  If any of the promises is resolved, this resulting promise will be returned
     *  with the same resolution value.
     */
    function any(promises) {
      var deferred = $delegate.defer(),
        counter = 0,
        results = angular.isArray(promises) ? [] : {};

      angular.forEach(promises, function (promise, key) {
        counter++;
        $delegate
          .when(promise)
          .then(function (value) {
            deferred.resolve(value);
          })
          .catch(function (reason) {
            results[key] = reason;
            if (!(--counter)) {
              deferred.reject(reason);
            }
          });
      });

      if (counter === 0) {
        deferred.reject(results);
      }

      return deferred.promise;
    }

    return $delegate;
  }

  angular
    .module('permission')
    .decorator('$q', $q);

})();
