TransitionProperties object in ui-router
============================

Before start
----------------------------

Make sure you are familiar with:
- [Installation guide for angular-route](https://github.com/Narzerus/angular-permission/blob/development/docs/ng-route/1-installation.md)
- [Usage in angular-route routes](https://github.com/Narzerus/angular-permission/blob/development/docs/ng-route/2-usage-in-routes.md)
- [Managing permissions](https://github.com/Narzerus/angular-permission/blob/development/docs/1-manging-permissions.md)   
- [Manging roles](https://github.com/Narzerus/angular-permission/blob/development/docs/2-manging-roles.md)   

Overview
----------------------------

TransitionProperties object is angular `Value` structure that if used with angular-route holds properties of the state transition inherited form `$routeChangeStart` event. It can met as parameter in all programmatic available methods in Permission module like: route access `only` and `except`, `redirectTo` used as functions or Permission events where some of the properties are exposed. All of the properties of TransitionProperties are described in the table below:

| Value type    |  Usage                         | 
| :------------ | :----------------------------- |
| `current`     | Source route definition object |
| `next`        | Target route parameters object | 


> :bulb: **Note**   
> As all the values passed to TransitionProperties are references to it's original values modification of those is not recommended, because may lead to unpredictable behaviour of angular-route. 