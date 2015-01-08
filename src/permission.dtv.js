(function () {
    'use strict';

    angular.module('permission').directive('permission', [
        'Permission',
        function (Permission) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var makeVisible = function () {
                            element.removeClass('ng-hide');
                        },
                        makeHidden = function () {
                            element.addClass('ng-hide');
                        },
                        determineVisibility = function (resetFirst) {
                            var result;
                            if (resetFirst) {
                                makeVisible();
                            }

                            // Convert array to object
                            var roleMap = {};
                            roleMap[attrs.permissionType] = roles;

                            // Test visibility required
                            result = false;
                            if (roleMap.only) {
                                angular.forEach(roleMap.only, function(rm) {
                                    // One of the roles should be true
                                    if (Permission.roleValidations[rm]()) {
                                        result = true;
                                    }
                                });
                            } else {
                                // Not one of these roles should pass
                                result = true;
                                angular.forEach(roleMap.except, function(rm) {
                                    if (Permission.roleValidations[rm]() && result) {
                                        result = false;
                                    }
                                });
                            }

                            if(result) {
                                makeVisible();
                            } else {
                                makeHidden();
                            }
                        },
                        roles = attrs.permission.split(',');


                    if (roles.length > 0) {
                        for (var i = 0; i < roles.length; i++) {
                            roles[i] = roles[i].trim();
                        }

                        determineVisibility(true);
                    }
                }
            };
        }]);
}());