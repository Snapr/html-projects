/*global _  define require */
define(['views/base/view', 'views/base/page', 'models/spot', 'views/base/side_scroll', 'collections/photo', 'collections/user', 'utils/geo', 'config'],
function(view, page_view, spot_model, side_scroll, photo_collection, users_collection, geo, config){

var spot_view = page_view.extend({

    post_initialize: function() {
    },

    post_activate: function(options) {
        this.change_page();

        $.mobile.showPageLoadingMsg();
        this.render();
    },

    events: {
    },

    render: function() {

        var new_el = $(this.template({
            initial:false,
            "status": "open",
            "closing_date": "2014-09-27 04:00:00",
            "title": "Test Competition",
            "short_description": "short",
            "hashtag": "#hashtag",
            "banner": {
                "mobile": "http://media-server2.snapr.us/comps/comps/100.jpeg",
                "main": "",
                "thumb": ""
            },
            "id": 1,
            "slug": "test-comp",
            data:{
                "status": "open",
                "closing_date": "2014-09-27 04:00:00",
                "title": "Test Competition",
                "short_description": "short",
                "hashtag": "#hashtag",
                "banner": {
                    "mobile": "http://media-server2.snapr.us/comps/comps/100.jpeg",
                    "main": "",
                    "thumb": ""
                },
                "id": 1,
                "slug": "test-comp"
            }
        }));

        this.$el.empty().append(new_el.children()).trigger( "create" );

        $.mobile.hidePageLoadingMsg();

    }
});

return spot_view;

});
