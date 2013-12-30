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
 * # Designing an integration
 * 
 * When designing an integration: 
 * - the methods defined below must exist in a integration
 * - they must follow the same naming convention
 * - they must return a promise that resolves or rejects
 *
 * --------------------------------------------
 *
 * # Public Interface Methods
 *
 * pageInterface#getNav
 * @return Object Navigation object
 *
 * pageInterface#update
 * @param Object newItem Item to be updated. Should include an ID
 *
 * pageInterface#add
 * @param Object Page object to be added to database
 *
 * pageInterface#remove
 * @param Object Page object to remove.
 *
 * pageInterface#getPageBySlug
 * @param String slug Slug of page to get
 *
 * pageInterface#updateArea
 * @param Int currentPageId Id of page to update area on
 * @param Area newArea Area to add or update
 *
 * --------------------------------------------
 *
 * # Private Interface Methods
 * These methods do not need to be in an integration
 *
 * pageInterface#currentPage
 * Stores the current page
 *
 * pageInterface#currentNav
 * Stores the current navigation
 *
 * --------------------------------------------
 *
 * # Classes
 * 
 * @Class Area: 
 * @prop slug String Slug of area
 * @prop content String Content of area, typically html or string. 
 *
 * @Class Page: 
 * @prop id Mixed Id of the current page. May be int or GUI from mongo
 * @prop slug String Slug of the page, typically used to get based on URL.
 * @prop template String (optional) Template for this page. 
 * @prop areas Array Holds of area objects for this page. 
 *
 */

angular
    .module('ngPage')
    .factory('ngPageInterface', ['ngPageIntegrationsMock',
        function(integration) {

            // create and expose interface methods
            var pageInterface = {};

            // hook functions into current integration
            pageInterface.getNav = function() {
                return integration.getNav().then(function(response) {
                    pageInterface.currentNav = response;
                    return response;
                });
            };
            pageInterface.update = integration.update;
            pageInterface.add = integration.add;
            pageInterface.remove = integration.remove;
            pageInterface.getPageBySlug = function(slug) {
                return integration.getPageBySlug(slug).then(function(response) {
                    pageInterface.currentPage = response;
                    return response;
                });
            };
            pageInterface.updateArea = integration.updateArea;


            // cache items to access in our page directives
            pageInterface.currentPage = null;
            pageInterface.currentNav = null;

            // expose
            return pageInterface;

        }
    ])
