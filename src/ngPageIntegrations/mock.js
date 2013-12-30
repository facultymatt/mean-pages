/**
 * Service that returns Mock data as promises to simulate a database call
 *
 */

 // @note this mock can be a template for any adapter
 // for example we could just replace all the mocks with resource calls
 // or firebase calls. 

// @todo move mock to separate mock file and keep this to functions


/**
 * --------------------------------------------
 * Interface for saving and getting pages and navigation
 * --------------------------------------------
 *
 * Users can define project specific integrations for different apis
 * for example if using firebase or express node apps.
 *
 * The page module itself will always communicate to the 
 * and the interface will then call the integrations
 *
 */

angular
    .module('ngPageIntegrationsMock', [])
    .factory('ngPageIntegrationsMock', ['$http', '$q', '$timeout',
        function($http, $q, $timeout) {
            // dummy data
            var itemList = [{
                id: 1,
                slug: 'page-1',
                template: 'views/page-custom.html',
                areas: [{
                    slug: 'heading',
                    content: '<h1>This is a heading</h1>'
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
            }, {
                id: 3,
                slug: 'page-3',
                template: 'views/page-tools.html',
                areas: [{
                    slug: 'teaser1',
                    content: 'stuff'
                },{
                    slug: 'teaser2',
                    content: 'stuff'
                },{
                    slug: 'teaser3',
                    content: 'stuff'
                },{
                    slug: 'teaser4',
                    content: 'stuff'
                }]
            }];


            // create and expose service methods
            var exports = {};

            exports.getNav = function() {

                var delay = $q.defer();

                $timeout(function() {

                    delay.resolve(itemList);

                }, 200);

                return delay.promise;
            };

            // get one item by id
            exports.get = function(id) {
                var theItem = _.find(itemList, function(item) {
                    return item.id == id;
                });
                return theItem ? theItem : false;
            };

            // update one item by item 
            // @note we figure out id from item
            exports.update = function(newItem) {
                var theIndex = _.findIndex(itemList, function(item) {
                    return item.id == newItem.id;
                });
                theList = _.extend(itemList[theIndex], newItem);
                return theList;
            };

            // add a new item
            exports.add = function(item) {
                item.id = itemList.length + 1;
                itemList.push(item);
                return item;
            };

            // remove item by item
            exports.remove = function(item) {
                itemList.splice(itemList.indexOf(item), 1);
                return item;
            };

            // update one item by item 
            // @note we figure out id from item
            exports.getBy = function(key, value) {

                var delay = $q.defer();

                $timeout(function() {

                    var theItem = _.find(itemList, function(item) {
                        return item[key] === value;
                    });

                    delay.resolve(theItem);

                }, 200);

                return delay.promise;

            };

            // updates a specific area given
            exports.updateArea = function(currentPageId, newArea) {

                // find index of current page
                var theIndex = _.findIndex(itemList, function(item) {
                    return item.id == currentPageId;
                });

                var areaIndex = _.findIndex(itemList[theIndex].areas, function(area) {
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
