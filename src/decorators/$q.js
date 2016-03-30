(function () {
  'use strict';

  angular
    .module('permission')
    .decorator('$q',
      /**
       * @class $q
       * @memberOf permission
       *
       * @param $delegate {Object} Angular promise implementation
       */
      function ($delegate) {

        $delegate.only = only;

        /**
         * Implementation of missing $q `only` method that wits for first resolution of provided promise set
         * @method
         * @private
         *
         * @param promises {Array|promise} Single or set of promises
         *
         * @returns {Promise} Returns a single promise that will be rejected with an array/hash of values,
         *  each value corresponding to the promise at the same index/key in the `promises` array/hash.
         *  If any of the promises is resolved, this resulting promise will be returned
         *  with the same resolution value.
         */
        function only(promises) {
          var deferred = $delegate.defer(),
            counter = 0,
            results = angular.isArray(promises) ? [] : {};

          angular.forEach(promises, function (promise, key) {
            counter++;
            $delegate.when(promise)
              .then(function (value) {
                if (results.hasOwnProperty(key)) {
                  return;
                }
                deferred.resolve(value);
              })
              .catch(function (reason) {
                if (results.hasOwnProperty(key)) {
                  return;
                }
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
      });
})();
