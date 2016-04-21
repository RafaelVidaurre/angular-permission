Installation guide for ui-router
============================

Before start
----------------------------

Make sure you are familiar with:
- [Managing permissions](https://github.com/Narzerus/angular-permission/blob/development/docs/1-manging-permissions.md)   
- [Manging routes](https://github.com/Narzerus/angular-permission/blob/development/docs/2-manging-roles.md)   

Overview
----------------------------

1. [Including dependencies in module](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/1-installation.md)
2. [Known issues](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/1-installation.md#known-issues)


Including dependencies in module
----------------------------

In order to angular-permission cooperate with your router you should include two modules `permission` and `permission.ui` to your module:

```javascript
angular.module('yourModule', [
  ...
  'ui.router', ('ct.ui.router.extras.core',) 
  'permission', 'permission.ui', 
  ...
]);
```

> :fire: **Important**   
> Angular permission is using ui-router state decoration to be able to inherit permissions/roles from parent states. So make sure that `permission` and `permission.ui` modules are included just after ui-router as in example above to ensure execution order form angular dependency injection mechanism.


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

----------------------------

> **Next to read**:   
> :point_right: [Usage in states](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/2-usage-in-states.md)