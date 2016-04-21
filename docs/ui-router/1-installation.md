Including dependencies in module
----------------------------

In order to angular-permission cooperate with your router you should include two modules `permission` and `permission.ui` to your module:

```javascript
angular.module('yourModule', [..., 'ui.router', ('ct.ui.router.extras.core',) 'permission', 'permission.ui',  ...]);
```

**Important!** Angular permission is using ui-router state decoration to be able to inherit permissions/roles from parent states. 
So make sure that `permission` and `permission.ui` modules are included just after ui-router as in example above to ensure execution order form angular dependency injection mechanism.

Known issues
----------------------------

Because of a bug in ui-router, when using `$urlStateProvider.otherwise` we get an **infinite digest** loop error.
A workaround was found by [@shoaibmerchant](https://github.com/shoaibmerchant) and it goes like this:

```javascript
// Normal usage (creates INFDG error)
$urlRouterProvider.otherwise('/somestate');

// Use instead
$urlRouterProvider.otherwise( function($injector) {
  var $state = $injector.get("$state");
  $state.go('/somestate');
});
```