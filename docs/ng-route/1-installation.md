Installation guide for ng-route
============================

Before start
----------------------------

Make sure you are familiar with:
- [Managing permissions](https://github.com/Narzerus/angular-permission/blob/development/docs/1-manging-permissions.md)   
- [Manging roles](https://github.com/Narzerus/angular-permission/blob/development/docs/2-manging-roles.md)   

Overview
----------------------------

1. [Including dependencies in module]()

Including dependencies in module
----------------------------

In order to angular-permission cooperate with your router you should include two modules `permission` and `permission.ng` to your module:

```javascript
angular.module('yourModule', [
  ...
  'ngRoute', 'permission', 'permission.ng', 
  ...
]);
```

----------------------------

> **Next to read**:   
> :point_right: [Usage in routes](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/2-usage-in-states.md)