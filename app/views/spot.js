/*global _  define require */
define(['backbone', 'views/base/page', 'models/spot', 'views/base/side_scroll', 'collections/photo', 'collections/user', 'utils/geo', 'native', 'config'],
function(Backbone, page_view, spot_model, side_scroll, photo_collection, users_collection, geo, native, config){

var spot_view = page_view.extend({

    post_initialize: function() {
        this.model = new spot_model();
        this.photos = new photo_collection();
        this.top_users = new users_collection();
    },

    post_activate: function(options) {

        this.$el.find('.spot-head').empty();
        this.$el.find('.image-streams').empty();
        this.$el.find('.top-users').empty();

        this.spot_id = options.query.spot_id || 0;
        this.change_page();
        this.fetch_spot();
        this.fetch_users();

        $.mobile.showPageLoadingMsg();
    },

    events: {
    },

    fetch_spot: function () {
        var spot_view = this,
            options = {
                data: {
                    spot_id: spot_view.spot_id,
                    full: true
                },
                success: function() {
                    spot_view.fetch_photos();
                },
                error: function() {
                    console.error('Error loading spot from server');
                }
            };

        var success_callback = function( location ){
            options.data.latitude = location.coords.latitude;
            options.data.longitude = location.coords.longitude;
            options.data.nearby = true;
            spot_view.model.fetch( options );
        };

        var error_callback = function(){
            spot_view.model.fetch( options );
        };

        geo.get_location( success_callback, error_callback );
    },

    fetch_photos: function () {
        var spot_view = this;

        spot_view.photos.fetch({
            data:{
                n:6,
                sort:'weighted_score',
                spot: spot_view.spot_id
            },
            success: function(){
                spot_view.render();
            }
        });
    },

    fetch_users: function () {
        var spot_view = this;

        spot_view.top_users.get_top_users(spot_view.spot_id);
    },

    render: function() {
        var $el = this.$el,
            $spot_header = $el.find('.spot-head').empty(),
            $streams = $el.find('.image-streams').empty(),
            $top_users = $el.find('.top-users').empty();

        var header = new spot_header_view({
            model: this.model,
        });
        $spot_header.append( header.el );
        header.render();

        var stream_li = new spot_image_stream({
            collection: this.photos,
            details: {
                spot: this.spot_id,
                stream_type: "spot",
            }
        });

        $streams.append( stream_li.el );
        stream_li.render();

        this.top_users.each( function(user) {
            var user_li = new spot_user_view({
                model: user
            });
            $top_users.append( user_li.el );
            user_li.render();
        });
        
        
        $.mobile.hidePageLoadingMsg();
        $el.trigger( "create" );

    },
});

var spot_header_view = Backbone.View.extend({
    initialize: function () {
        this.template = _.template( $("#spot-header-template").html() );
    },
    render: function () {
        this.$el.html( this.template({
            spot: this.model
        }));
    }
});

var spot_image_stream = side_scroll.extend({
    tagName: 'li',
    className: 'image-stream',
    template: _.template( $('#spot-stream-template').html() ),
    thumbs_template: _.template( $('#spot-stream-thumb-template').html() ),

    post_initialize: function(){

        this.details = {
            spot: this.options.spot
        };

        
        this.collection.data = {
            spot: this.details.spot,
            n: config.get('side_scroll_initial') 
        };

    }
});

var spot_user_view = Backbone.View.extend({
    tagName: 'li',
    className: 'top-user-item',
    template: _.template( $("#spot-top-user-item").html() ),
    
    render: function () {
        this.$el.html( this.template({
            user: this.model
        }));
    }
});

return spot_view;

});
