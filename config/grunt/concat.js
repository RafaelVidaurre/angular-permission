module.exports = function () {
  'use strict';

  return {
    options: {
      banner: '<%= meta.banner %>\n',
      separator: '\n\n'
    },
    dist: {
      files: {
        'dist/<%= pkg.name %>.js': [
          '<%= paths.src %>/permission.js',
          '<%= paths.src %>/decorators/$q.js',
          '<%= paths.src %>/strategies/PermissionStrategies.js',
          '<%= paths.src %>/transition/TransitionProperties.js',
          '<%= paths.src %>/transition/TransitionEvents.js',
          '<%= paths.src %>/models/PermissionMap.js',
          '<%= paths.src %>/models/StatePermissionMap.js',
          '<%= paths.src %>/models/Permission.js',
          '<%= paths.src %>/models/Role.js',
          '<%= paths.src %>/stores/PermissionStore.js',
          '<%= paths.src %>/stores/RoleStore.js',
          '<%= paths.src %>/directives/permission.js',
          '<%= paths.src %>/authorization/Authorization.js',
          '<%= paths.src %>/authorization/StateAuthorization.js'
        ]
      }
    }
  };
};