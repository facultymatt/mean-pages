# ngPage

### This module brings the concept of pages with editable areas to AngularJS. This concept is inspired by the CMS [Apostrophe](http://demo2.apostrophenow.com/).

This module is still in development. Focus is currently on the user interface, directives, and other Angular specific implementations. It assumes a simple backend exists for serving pages. A basic example is provided. A more robust backend will be developed later, with support for finding pages by tag, searching, hierarchies, etc.

## Pattern

It's typical to build a site with angular where each page is an html template. Maybe a generic template exists and is populated with data in scope, for example `$scope.title` and `$scope.body`. The router is then configured to serve templates for each route. If the developer wants to add more content they must edit the controller or model scripts. 

A more desirable pattern is provided by the ngPages module.   

- Each **page** is persisted to a database
- A **page** is responsible for knowing which **template** it should use for display
- Each page can have an unlimited number of **areas** which can be any html. Additionally areas can be limited to certain html tags. 
- **Areas** are persisted with the page and don't require extra scope variables to be configured.
- **Navigation** can be generated by listing **pages** since each page is aware of its route.
- **Routes** are configured automatically from registered pages.
- **Page** content is **resolved** before the page is displayed to the user, preventing a flash of missing content. 

## How to Use

### Setup
- Install and include in your project. 
- Setup express, mongodb, and expose routes to persist and retrieve pages. 

### API

#### area
This directive registers an area on a page. Areas should have unique names. Areas can be nested, for example `body.primary` and `body.secondary`. Areas will be editable if user has proper permissions. This directive is restricted to `A` so it must be used as an attribute.  

```
// current route is `/page-1`
// this will register three areas on page with slug `page-1`
<div area="title"></div>
<div area="author"></div>
<div area="body"></div>
```

#### nav

Nav will create a navigation list that links to each page. Currently its limited to getting all pages in the database. 

```
<nav></nav>
```

Will generate the following html given that two pages, `page-1` and `page-2` are in the database:

```
<ul>
    <li>
        <a ng-href="#/page-1" title="page-1" href="#/page-1">page-1</a>
    </li>
    <li>
        <a ng-href="#/page-2" title="page-2" href="#/page-2">page-2</a>
    </li>
</ul>

```

## Development

NOTE This module is still in heavy development and should not be used in production sites. This module will not be versioned until a stable development version exists.

NOTE That a backend mock exits for persisting changes per app session but not to a database. 
