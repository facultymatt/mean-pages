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
    .module('ngPage', ['ngSanitize', 'textAngular', 'ngPageIntegrationsMock'])
    .run(function($rootScope, $route, $http, $templateCache, $location) {

        // page resolve which gets page from database by slug
        // and then resolves template if page has a custom template defined
        var page = function($q, $timeout, $route, ngPageInterface) {

            // create defers for page and template
            var delay = $q.defer();
            var templateDelay = $q.defer();

            // get current path
            var slug = $route.current.originalPath;

            // remove the first slash to make a slug
            // @note the slug can be in page/subpage format which we can just store 
            // in the database as such
            // or we can slide at / and get last item in array.
            if (slug && slug[0] === '/') {
                slug = slug.slice(1, slug.length);
            }

            // replace template with
            // @todo check for template setting and don't defer if set 
            //   a promise is the only way to defer template loading until after 
            //   our page load. We need to wait until then because a custom template
            //   might be defined in the page.
            $route.current.template = function() {
                return templateDelay.promise;
            };

            // get page from API and cache
            // cache within ngPageInterface as ngPageInterface.currentPage
            // which makes it accessiable in our directives.
            // 
            // @note that we are not using resolve in the traditional sense where
            //   we then inject resolved data into the page controller. 
            //   Instead we cache it within ngPageInterface and this becomes
            //   and easy way to access across the app.
            //   
            // @todo this is how we can access the page within our area directive
            //
            var lookupPage = ngPageInterface.getPageBySlug(slug).then(function(response) {

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
                    }).then(function(html) {

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
        var nav = function($q, $timeout, $route, ngPageInterface) {

            // create defer
            var delay = $q.defer();

            // get page from API and cache within ngPageInterface
            // @todo this is how we can access the page within our area directive
            // @note we don't need to save this as lookupNav because its cached in the ngPageInterface
            ngPageInterface.getNav().then(function(response) {
                delay.resolve(response);
            });

            // @todo add error checking if no nav exists

            // return promise
            return delay.promise;
        }

        // add a resolve function to all routes
        angular.forEach($route.routes, function(route) {

            // if a route doesn't have a current resolve, add a placeholder
            // resolve will be an object, not array
            if (!route.resolve) route.resolve = {};

            // add lookup resolve
            route.resolve.page = page;
            route.resolve.nav = nav;

        });

    })
