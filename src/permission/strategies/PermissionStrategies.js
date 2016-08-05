'use strict';

/**
 * Pre-defined available configurable behaviours of directive `permission`
 * @name permission.PermPermissionStrategies
 * @readonly
 *
 * @example
 * <div permission
 *      permission-except="'MANAGER'"
 *      permission-on-authorized="PermPermissionStrategies.renderContent"
 *      permission-on-unauthorized="PermPermissionStrategies.removeContent">
 * </div>
 *
 * @property enableElement {Function}
 * @property disableElement {Function}
 * @property showElement {Function}
 * @property hideElement {Function}
 */
var PermPermissionStrategies = {
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
  .value('PermPermissionStrategies', PermPermissionStrategies)
  .value('PermissionStrategies', PermPermissionStrategies);
