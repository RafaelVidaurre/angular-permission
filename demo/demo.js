var app = angular
  .module('app', [
    'ui.router',
    'permission',
    'permission.ui'
  ]);

app
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('app', {
        abstract: true,
        views: {
          nav: {
            templateUrl: 'nav.html'
          },
          main: {
            templateUrl: 'main.html'
          }
        }
      })

      .state('app.map', {
        url: '/map',
        views: {
          article: {
            templateUrl: 'map.html'
          }
        }
      })

      .state('app.work', {
        url: '/work',
        views: {
          article: {
            templateUrl: 'work.html'
          }
        },
        data: {
          permissions: {
            only: ['AUTHORIZED'],
            redirectTo: function() {
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

      .state('app.location', {
        url: '/location',
        abstract: true,
        data: {
          permissions: {
            only: ['AUTHORIZED'],
            redirectTo: function() {
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

      .state('app.location.pin', {
        url: '/pin',
        views: {
          'article@app': {
            templateUrl: 'pin.html'
          }
        }
      })

      .state('app.location.memory', {
        url: '/memory',
        views: {
          'article@app': {
            templateUrl: 'memory.html'
          }
        }
      });


    $urlRouterProvider.otherwise(function($injector) {
      var $state = $injector.get('$state');
      $state.go('app.map');
    });
  })

  .run(function(PermRoleStore, appConf) {
    PermRoleStore.defineRole('AUTHORIZED', function() {
      return appConf.isAuthorized;
    });
  })

  .value('appConf', {
    isAuthorized: false,
    isCollapsed: false
  })

  .controller('appController', function($state, appConf) {
    // variables
    this.conf = appConf;

    // methods
    this.authorize = authorize;
    this.toggleMenu = toggleMenu;

    function authorize() {
      appConf.isAuthorized = !appConf.isAuthorized;
      $state.reload();
    }

    function toggleMenu() {
      appConf.isCollapsed = !appConf.isCollapsed;
    }
  });
