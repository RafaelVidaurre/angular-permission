module.exports = function(grunt) {
  'use strict';

  var path = require('path');

  require('load-grunt-config')(grunt, {
    configPath: path.join(process.cwd(), 'config/grunt'),
    data: {
      meta: {
        banner: '/**\n' +
        ' * <%= pkg.name %>\n' +
        ' * <%= pkg.description %>\n' +
        ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * @link <%= pkg.homepage %>\n' +
        ' * @author <%= pkg.authors.join(", ") %>\n' +
        ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' +
        ' */\n\n',
        'banner-ui': '/**\n' +
        ' * <%= pkg.name %>-ui\n' +
        ' * Extension module of angular-permission for access control within ui-router\n' +
        ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * @link <%= pkg.homepage %>\n' +
        ' * @author <%= pkg.authors.join(", ") %>\n' +
        ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' +
        ' */\n\n',
        'banner-ng': '/**\n' +
        ' * <%= pkg.name %>-ng\n' +
        ' * Extension module of angular-permission for access control within angular-route\n' +
        ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * @link <%= pkg.homepage %>\n' +
        ' * @author <%= pkg.authors.join(", ") %>\n' +
        ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' +
        ' */\n\n'
      },
      pkg: grunt.file.readJSON('bower.json'),
      paths: {
        src: 'src',
        dist: 'dist',
        test: 'test',
        coverage: 'coverage'
      }
    }
  });
};
