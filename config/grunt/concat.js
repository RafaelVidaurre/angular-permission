module.exports = function () {
  'use strict';

  return {
    options: {
      banner: '<%= meta.banner %>\n',
      separator: '\n\n'
    },
    permission: {
      files: {
        'dist/<%= pkg.name %>.js': [
          '<%= paths.src %>/permission/permission.js',
          '<%= paths.src %>/permission-ui/permission-ui.js',
          '<%= paths.src %>/permission/decorators/$q.js',
          '<%= paths.src %>/permission/strategies/PermissionStrategies.js',
          '<%= paths.src %>/permission/transition/TransitionProperties.js',
          '<%= paths.src %>/permission/transition/TransitionEvents.js',
          '<%= paths.src %>/permission/models/PermissionMap.js',
          '<%= paths.src %>/permission/models/StatePermissionMap.js',
          '<%= paths.src %>/permission/models/Permission.js',
          '<%= paths.src %>/permission/models/Role.js',
          '<%= paths.src %>/permission/stores/PermissionStore.js',
          '<%= paths.src %>/permission/stores/RoleStore.js',
          '<%= paths.src %>/permission/directives/permission.js',
          '<%= paths.src %>/permission/authorization/Authorization.js',
          '<%= paths.src %>/permission/authorization/StateAuthorization.js'
        ]
      }
    },
    'permission-ui': {
      files: {
        'dist/<%= pkg.name %>.js': [
          '<%= paths.src %>/permission-ui/permission-ui.js',
          '<%= paths.src %>//permission-ui/decorators/TransitionEvents.js'
        ]
      }
    }
  };
};