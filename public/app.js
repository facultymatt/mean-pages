angular
    .module('app', ['ngResource', 'ngRoute', 'ngSanitize', 'MEANPages'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                redirectTo: '/page-1'
            })
            .when('/page-1', {})
            .when('/page-2', {})
            .when('/page-3', {})
            .when('/404', {})
            .otherwise({
                redirectTo: '/404'
            })
    })


/**
 * MEAN pages module
 * --------------------
 *
 * provides:
 * - A service for retrieving pages by slug
 * - A hook on all routes that resolves current page from database
 * - Directives to define content "areas" within a page template
 * - Load page template defined by `page.template`
 *
 */
angular
    .module('MEANPages', [])
    .run(function ($rootScope, $route, $http, $templateCache, $location) {

        // page resolve which gets page from database by slug
        // and then resolves template if page has a custom template defined
        var page = function ($q, $timeout, $route, pageService) {

            // create defers for page and template
            var delay = $q.defer();
            var templateDelay = $q.defer();

            // get current path
            var slug = $route.current.originalPath;

            // remove the first slash to make a slug
            // @note the slug can be in page/subpage format which we can just store 
            // in the database as such
            // or we can slide at / and get last item in array.
            if (slug[0] === '/') {
                slug = slug.slice(1, slug.length);
            }

            // replace template with
            // @todo check for template setting and don't defer if set 
            //   a promise is the only way to defer template loading until after 
            //   our page load. We need to wait until then because a custom template
            //   might be defined in the page.
            $route.current.template = function () {
                return templateDelay.promise;
            };

            // get page from API and cache
            // cache within pageService as pageService.currentPage
            // which makes it accessiable in our directives.
            // 
            // @note that we are not using resolve in the traditional sense where
            //   we then inject resolved data into the page controller. 
            //   Instead we cache it within pageService and this becomes
            //   and easy way to access across the app.
            //   
            // @todo this is how we can access the page within our area directive
            //
            var lookupPage = pageService.getBy('slug', slug).then(function (response) {

                // handle case of no page!
                // not we could optionally allow this to load and just not have a
                // page instance for this.
                // example would be static page with "work" where work items are not
                // pages and we want to allow access to these
                if (!response) {
                    //$location.path('/404');
                }

                // check if this page has a custom template or set default
                var tPath = response && response.template || 'views/page-default.html';

                // check the template cache for this template
                // @note because we are over riding the native angular template
                //   handling we want to ensure to cache templates
                //   to increase performance. 
                var data = $templateCache.get(tPath);

                // return data right away if we have it
                if (data) {

                    templateDelay.resolve(data);

                    // else do an http request to get it, caching the template too
                } else {

                    // get template
                    $http.get(tPath, {
                        cache: true,
                        method: 'GET'
                    }).then(function (html) {

                        // cache the response and resolve promise
                        $templateCache.put(tPath, html.data);
                        templateDelay.resolve(html.data);

                    });

                }

                // resolve our page promise
                delay.resolve(response);

            });

            // @todo add error checking if no page exists

            // return page promise
            return delay.promise;
        }

        // function to add as resolve which will lookup the page
        var nav = function ($q, $timeout, $route, pageService) {

            // create defer
            var delay = $q.defer();

            // get page from API and cache within pageService
            // @todo this is how we can access the page within our area directive
            // @note we don't need to save this as lookupNav because its cached in the pageService
            pageService.getNav().then(function (response) {
                delay.resolve(response);
            });

            // @todo add error checking if no nav exists

            // return promise
            return delay.promise;
        }

        // add a resolve function to all routes
        angular.forEach($route.routes, function (route) {

            // if a route doesn't have a current resolve, add a placeholder
            // resolve will be an object, not array
            if (!route.resolve) route.resolve = {};

            // add lookup resolve
            route.resolve.page = page;
            route.resolve.nav = nav;

        });

    })

/**
 * Directive to assemble a simple nav from
 *
 */
.directive('nav', ['pageService',
    function (pageService) {

        var template = '<ul>' +
            '<li ng-repeat="page in pages">' +
            '<a ng-href="#/{{page.slug}}" title="{{page.slug}}">{{page.slug}}</a>' +
            '</li>' +
            '</ul>';

        return {
            restrict: 'AE',
            replace: true,
            template: template,
            link: function (scope, element, attrs, ctrl) {

                // creates a local ref to pages
                // @note this works because the template compile is postponed
                // untill our PageService resolves. If using nav outside ng-view
                // we'll need to build this out
                scope.pages = pageService.currentNav;

            }
        }

    }
])

/**
 * Directive to define "areas" of editable and database persisting content
 *
 */
.directive('area', ['pageService', '$compile',
    function (pageService, $compile) {

        // parses current page to return content area given a slug
        // if no content area is found, will create an empty content area 
        // with slug name and return
        // this basically creates a new slug for areas with no prior content
        // in the database
        function getAreaContentFromSlug(slug) {
            var area;
            if (pageService.currentPage && pageService.currentPage.areas) {
                area = _.findWhere(pageService.currentPage.areas, {
                    "slug": slug
                });
            }
            return area && area.slug ? area : {
                slug: slug,
                content: ''
            };
        }

        return {
            restrict: 'AE',
            scope: true,
            link: function (scope, element, attrs) {

                // we check attrs bind to prevent infinate loop
                // @todo can we move this to compile? 
                if (!attrs.ngBindHtml) {
                    element.attr('ng-bind-html', 'content');
                    $compile(element)(scope);
                }

                // allow content editing
                element.attr('contenteditable', true);

                // rough watch for change within the element
                // @note when we make this more robust, adding wysiwyg editor etc 
                //       we'll get the new data in a much more robust way. 
                //       for now we just watch for change events and update the service
                //       on change
                //
                element.on('blur keyup paste', function (event) {
                    scope.area.content = element[0].innerHTML;
                    pageService.updateArea(scope.area);
                });

                // set content within this scope
                scope.area = getAreaContentFromSlug(attrs.area);
                scope.content = scope.area.content;

            }

        }

    }
])

/**
 * Service that returns Mock data as promises to simulate a database call
 *
 */
.factory('pageService', ['$http', '$q', '$timeout',
    function ($http, $q, $timeout) {
        // dummy data
        var itemList = [{
            id: 1,
            slug: 'page-1',
            template: 'views/page-custom.html',
            areas: [{
                slug: 'heading',
                content: 'This is a heading'
            }, {
                slug: 'body1',
                content: 'This is a body with some <strong>Strong HTML</strong> in it!'
            }, {
                slug: 'body2',
                content: 'This is body 2'
            }]
        }, {
            id: 2,
            slug: 'page-2',
            areas: [{
                slug: 'heading',
                content: 'Page 2 Heading'
            }, {
                slug: 'body1',
                content: 'Body 1'
            }, {
                slug: 'body2',
                content: 'body 2 text goes here <h3>Matt</h3>'
            }]
        }];


        // create and expose service methods
        var exports = {};

        // cache items to access in our page directives
        exports.currentPage = null;
        exports.currentNav = null;

        exports.getNav = function () {

            var delay = $q.defer();

            $timeout(function () {

                exports.currentNav = itemList;
                delay.resolve(itemList);

            }, 2000);

            return delay.promise;
        };

        // get one item by id
        exports.get = function (id) {
            var theItem = _.find(itemList, function (item) {
                return item.id == id;
            });
            return theItem ? theItem : false;
        };

        // update one item by item 
        // @note we figure out id from item
        exports.update = function (newItem) {
            var theIndex = _.findIndex(itemList, function (item) {
                return item.id == newItem.id;
            });
            theList = _.extend(itemList[theIndex], newItem);
            return theList;
        };

        // add a new item
        exports.add = function (item) {
            item.id = itemList.length + 1;
            itemList.push(item);
            return item;
        };

        // remove item by item
        exports.remove = function (item) {
            itemList.splice(itemList.indexOf(item), 1);
            return item;
        };

        // update one item by item 
        // @note we figure out id from item
        exports.getBy = function (key, value) {

            var delay = $q.defer();

            $timeout(function () {

                var theItem = _.find(itemList, function (item) {
                    return item[key] === value;
                });

                // cache current page
                exports.currentPage = theItem;

                delay.resolve(theItem);

            }, 2000);

            return delay.promise;

        };

        // updates a specific area given
        exports.updateArea = function (newArea) {

            // find index of current page
            var theIndex = _.findIndex(itemList, function (item) {
                return item.id == exports.currentPage.id;
            });

            var areaIndex = _.findIndex(itemList[theIndex].areas, function (area) {
                return area.slug == newArea.slug;
            });

            // add empty area
            if (areaIndex === -1) {
                itemList[theIndex].areas.push({
                    slug: newArea.slug,
                    content: newArea.content
                });

                // update the area of current page with new content
            } else {
                itemList[theIndex].areas[areaIndex].content = newArea.content;
            }

        };

        return exports;

    }
])