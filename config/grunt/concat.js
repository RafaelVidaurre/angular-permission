module.exports = function () {
  'use strict';

  return {
    options: {
      banner: '<%= meta.banner %>\n'
    },
    dist: {
      files: {
        'dist/<%= pkg.name %>.js': [
          '<%= paths.src %>/core/permissionModule.js',
          '<%= paths.src %>/models/PermissionMap.js',
          '<%= paths.src %>/models/Permission.js',
          '<%= paths.src %>/models/Role.js',
          '<%= paths.src %>/stores/PermissionStore.js',
          '<%= paths.src %>/stores/RoleStore.js',
          '<%= paths.src %>/core/permissionDirective.js',
          '<%= paths.src %>/authorization/Authorization.js'
        ]
      }
    }
  };
};