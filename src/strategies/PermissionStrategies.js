(function () {
  'use strict';

  /**
   * Pre-defined available configurable behaviours of directive `permission`
   * @example
   * <div permission
   *      permission-except="'MANAGER'"
   *      permission-on-authorized="PermissionStrategies.renderContent"
   *      permission-on-unauthorized="PermissionStrategies.removeContent">
   * </div>
   */
  angular
    .module('permission')
    .constant('PermissionStrategies', {
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
    });
}());
