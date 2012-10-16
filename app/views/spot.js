/*global _  define require */
define(['views/base/view', 'views/base/page', 'models/spot', 'views/base/side_scroll', 'collections/photo', 'collections/user', 'utils/geo', 'config'],
function(view, page_view, spot_model, side_scroll, photo_collection, users_collection, geo, config){

var spot_view = page_view.extend({

    post_initialize: function() {

        this.top_users = new users_collection();
    },

    post_activate: function(options) {
        this.model = new spot_model();
        this.photos = new photo_collection();


        this.$el.find('.top-users-heading').hide();
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
        var spot_view = this,
            data = {
                n: 6,
                sort: 'weighted_score'
            };


        // Spot has more than 1 photos (Hero is the first photo)
        if (spot_view.model.get('stats').photos_count > 1) {
            data.spot = spot_view.spot_id;
            spot_view.photos.title = "popular";
        }
        // No photos, do nearby search
        else {
            data.nearby = true;
            data.radius = 1000;
            data.latitude = spot_view.model.get('location').latitude;
            data.longitude = spot_view.model.get('location').longitude;
            spot_view.photos.title = "popular nearby";
        }

        spot_view.photos.fetch({
            data: data,
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
            $top_users = $el.find('.top-users').empty(),
            spot_view = this;

        var header = new spot_header_view({
            model: this.model
        });
        $spot_header.append( header.el );
        header.render();

        // Filter out the photo that is the hero image
        var title = this.photos.title;
        this.photos = new photo_collection(this.photos.filter(function (model) {
            return spot_view.model.get('info').hero_image === null || model.get('secret') !== spot_view.model.get('info').hero_image.secret;
        }));
        if (this.photos.length > 0) {
            var stream_li = new side_scroll({
                collection: this.photos,
                title: title,
                expand: true
            });

            $streams.append( stream_li.el );
            stream_li.render();
        }


        // Don't shot if only 1 user as this is the hero
        if (this.top_users.length > 1) {
            this.$el.find('.top-users-heading').show();
            this.top_users.each( function(user) {
                var user_li = new spot_user_view({
                    model: user
                });
                $top_users.append( user_li.el );
                user_li.render();
            });
        }

        $.mobile.hidePageLoadingMsg();
        $el.trigger( "create" );

    }
});

var spot_header_view = view.extend({
    initialize: function () {
        this.template = this.get_template('components/spots/header');
    },
    render: function () {
        this.$el.html( this.template({
            spot: this.model
        }));
    }
});

var spot_user_view = view.extend({
    tagName: 'li',
    className: 'top-user-item',

    initialize: function(){
        this.template = this.get_template('components/spots/top_user');
    },

    render: function () {
        this.$el.html( this.template({
            user: this.model
        }));
    }
});

return spot_view;

});
