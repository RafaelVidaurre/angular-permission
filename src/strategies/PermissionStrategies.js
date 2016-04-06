(function () {
  'use strict';

  /**
   * Pre-defined available configurable behaviours of directive `permission`
   * @name PermissionStrategies
   * @memberOf permission
   * @readonly
   *
   * @example
   * <div permission
   *      permission-except="'MANAGER'"
   *      permission-on-authorized="PermissionStrategies.renderContent"
   *      permission-on-unauthorized="PermissionStrategies.removeContent">
   * </div>
   *
   * @property enableElement {Function}
   * @property disableElement {Function}
   * @property showElement {Function}
   * @property hideElement {Function}
   */
  var PermissionStrategies = {
    enableElement: function ($element) {
      $element.removeAttr('disabled');
    },
    disableElement: function ($element) {
      $element.attr('disabled', 'disabled');
    },
    showElement: function ($element) {
      $element.removeClass('ng-hide');
    },
    hideElement: function ($element) {
      $element.addClass('ng-hide');
    }
  };

  angular
    .module('permission')
    .constant('PermissionStrategies', PermissionStrategies);

}());
