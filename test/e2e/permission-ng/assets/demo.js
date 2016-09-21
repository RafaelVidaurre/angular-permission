var app = angular
  .module('app', [
    'ngRoute',
    'permission',
    'permission.ng'
  ]);

app
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'main.html'
      })

      .when('/work', {
        templateUrl: 'main.html',
        data: {
          permissions: {
            only: ['AUTHORIZED'],
            redirectTo: function () {
              return {
                state: 'app.map',
                options: {
                  reload: true
                }
              };
            }
          }
        }
      })

      .when('/location/pin', {
        templateUrl: 'main.html',
        data: {
          permissions: {
            only: ['AUTHORIZED'],
            redirectTo: function () {
              return {
                state: 'app.map',
                options: {
                  reload: true
                }
              };
            }
          }
        }
      })

      .when('/location/memory', {
        templateUrl: 'main.html',
        data: {
          permissions: {
            only: ['AUTHORIZED'],
            redirectTo: function () {
              return {
                state: 'app.map',
                options: {
                  reload: true
                }
              };
            }
          }
        }
      })

      .otherwise({
        redirectTo: '/'
      });
  })

  .run(function (PermRoleStore, appConf) {
    PermRoleStore.defineRole('AUTHORIZED', function () {
      return appConf.isAuthorized;
    });
  })

  .value('appConf', {
    isAuthorized: false,
    isCollapsed: false
  })

  .controller('appController', function ($location, $route, appConf) {
    this.conf = appConf;
    // methods
    this.authorize = authorize;
    this.toggleMenu = toggleMenu;
    this.currentPath = currentPath;

    function currentPath() {
      return $location.path();
    }

    function authorize() {
      appConf.isAuthorized = !appConf.isAuthorized;
      $route.reload();
    }

    function toggleMenu() {
      appConf.isCollapsed = !appConf.isCollapsed;
    }
  });
