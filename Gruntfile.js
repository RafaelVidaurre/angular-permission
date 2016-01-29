module.exports = function(grunt) {
  'use strict';

  var path = require('path');

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

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
        ' */\n',
      },
      pkg: grunt.file.readJSON('bower.json'),
      paths: {
        src: 'src',
        dist: 'dist',
        test: 'test'
      }
    }
  });
};
