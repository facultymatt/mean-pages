/**
 * Mock interface that persists pages and areas to variable.
 * Used for demo and development. Simulates an api call by
 * returning promises. 
 * 
 * @note Will reset on page refresh.
 *
 * @todo ensure all are promises
 *
 */

angular
    .module('ngPageIntegrationsMock', [])
    .factory('ngPageIntegrationsMock', ['$http', '$q', '$timeout', 'dataMock',
        function($http, $q, $timeout, itemList) {

            // create and expose service methods
            var exports = {};

            exports.getNav = function() {
                var delay = $q.defer();
                $timeout(function() {
                    delay.resolve(itemList);
                }, 200);
                return delay.promise;
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
            exports.getPageBySlug = function(slug) {
                var delay = $q.defer();
                $timeout(function() {
                    var theItem = _.find(itemList, function(item) {
                        return item.slug === slug;
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

                if (areaIndex === -1) {
                    // add empty area
                    itemList[theIndex].areas.push({
                        slug: newArea.slug,
                        content: newArea.content
                    });

                } else {
                    // update the area of current page with new content
                    itemList[theIndex].areas[areaIndex].content = newArea.content;
                }

            };

            return exports;

        }
    ])
    .factory('dataMock', function() {
        return [{
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
            }, {
                slug: 'teaser2',
                content: 'stuff'
            }, {
                slug: 'teaser3',
                content: 'stuff'
            }, {
                slug: 'teaser4',
                content: 'stuff'
            }]
        }];
    });
