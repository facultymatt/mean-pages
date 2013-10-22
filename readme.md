# MEAN Pages (or Well Fed pages)

MEAN pages brings pages with easy to add and edit content areas. The module works by adding a resolve function to every route that looks up a matching page for that route. This page is used to populate user defined "areas" of content.

MEAN pages makes it easy for a developer to provide user editable content areas within a page.  


### Include MEAN Pages in your app

Include the file in your project. Then include in your app like so: 

`angular.module('app', ['MEANPages'])`


### Define app routes

Note that since template urls are stored with the page in the db and assigned at run time, you only need to register a path and pass an empty config object.

	angular
		.module('app', ['MEANPages'])
		.config(function ($routeProvider) {
			$routeProvider
			    .when('/page-1', {})
			    .when('/page-2', {})
			    .when('/page-3', {})
		})

### Desgin templates

MEAN pages allows you to create templates and define "areas" which are editable and stored in a database. For example:

	<h1 area="heading"></h1>

	<div area="body1" area-html="bold, h1, h2, h3, h4, p"></div>

	<div area="body2" area-html></div>

This will create 3 areas on this page.


