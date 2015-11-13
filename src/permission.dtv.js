(function () {
	'use strict';

	angular.module('permission')
		.directive('permission', ['$log', 'Permission', function ($log, Permission) {
			return {
				restrict: 'A',
				link: function (scope, element, attrs) {
					try {
						if (attrs.permissionType === "only" || attrs.permissionType === "except") {
							var permissions = attrs.permissions.trim().split(',');

							Permission
								.authorize({permissionType: permissions})
								.then(function () {
									element.show();
								})
								.catch(function () {
									element.hide();
								});
						} else {
							$log.error('Unaccepted permissionType attribute value. Only accepted are: "only" and "except"');
							element.hide();
						}
					} catch (e) {
						$log.error('Permission directive error: ' + e.message);
						element.hide();
					}
				}
			};
		}]);
});