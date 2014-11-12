'use strict';

angular.module('demoApp', ['ui.router', 'permission']);

angular.module('demoApp').controller('MessageInterceptorController', function ($scope) {
	var self = this;

	$scope.$on('$stateChangePermissionAccepted', function (event, toState, toParams, fromState, fromParams, role, reason) {
		console.log('accepted', arguments);
		self.status = 'accepted'; 
		self.message = {
			toState: toState,
			toParams: toParams,
			fromState: fromState,
			fromParams: fromParams,
			role: role,
			reason: reason
		};
	});

	$scope.$on('$stateChangePermissionDenied', function (event, toState, toParams, fromState, fromParams, role, reason) {
		console.log('denied', arguments);
		self.status = 'denied'; 
		self.message = {
			toState: toState,
			toParams: toParams,
			fromState: fromState,
			fromParams: fromParams,
			role: role,
			reason: reason
		};
	});

});

angular.module('demoApp').config(function ($stateProvider, $urlRouterProvider) {

	$stateProvider.state('home', {
		url: '/',
		templateUrl: 'home.template.html'
	});

	$stateProvider.state('restricted', {
		url: '/restricted',
		template: '<h1>Restricted</h1>',
		data: {
			permissions: {
				all: {
					'roleA': {
						redirectTo: 'stateA'
					}, 
					'roleB': {
						redirectTo: 'stateB'
					}
				},
				redirectTo: 'stateC'
			}			
		}
	});

	$stateProvider.state('stateA', {
		url: '/stateA',
		template: '<h1>State A</h1>'
	});

	$stateProvider.state('stateB', {
		url: '/stateB',
		template: '<h1>State B</h1>'
	});

	$stateProvider.state('stateC', {
		url: '/stateC',
		template: '<h1>State C</h1>'
	});

	$urlRouterProvider.otherwise('/');
});

angular.module('demoApp').run(function (Permission, $q) {

  Permission.defineRole('roleA', function () {
  	var deferred = $q.defer();
  	deferred.resolve('Hello World');
    return deferred.promise;
  });

  Permission.defineRole('roleB', function () {
  	var deferred = $q.defer();
  	deferred.reject('Hello Test');
  	return deferred.promise;
  });
});
