(function () {

  angular.module('permission')
      .directive('permission', ['removeElement', 'Permission', function (removeElement, Permission) {
        return{
          restrict: 'A',
          link: function (scope, element, attributes) {

            var hasAccess = false;
            var allowedAccess = attributes.permission.split(":");
            var modelClass = allowedAccess[0];
            var modelOperation = allowedAccess[1];
            var rolePermissions = null;

            angular.forEach(Permission.roleValidations, function(r){
              var res = r.call();
              if(rolePermissions == null && res != false){
                rolePermissions = res;
              }
            });

            if( rolePermissions[modelClass] ){
              hasAccess = (rolePermissions[modelClass].indexOf(modelOperation) != -1)
            }

            if (!hasAccess) {
              angular.forEach(element.children(), function (child) {
                removeElement(child);
              });
              removeElement(element);
            }

          }
        }
      }]).constant('removeElement', function(element){
        element && element.remove && element.remove();
      });
}());
