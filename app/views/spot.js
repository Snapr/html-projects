/*global _  define require */
define(['views/base/view', 'views/base/page', 'models/spot', 'views/base/side_scroll', 'collections/photo', 'collections/user', 'utils/geo', 'config'],
function(view, page_view, spot_model, side_scroll, photo_collection, users_collection, geo, config){

var spot_view = page_view.extend({

    post_initialize: function() {
        this.top_users = new users_collection();
        this.top_users.on('all', this.render_top_users);

        this.photos = new photo_collection();
        this.photos.on('all', this.render_photos);
    },

    post_activate: function(options) {
        this.model = new spot_model({id: options.query.spot_id});

        $.mobile.showPageLoadingMsg();

        this.$('.spot-head').empty();
        this.$('.image-streams').empty();
        this.$('.top-users').empty();

        this.spot_id = options.query.spot_id || 0;
        this.change_page();
        this.fetch_spot();

    },

    get_override_tab: function(){ return 'spots'; },

    fetch_spot: function () {
        var spot_view = this,
            options = {
                data: {
                    full: true
                },
                success: function() {
                    spot_view.replace_from_template({spot:spot_view.model}, ['.spot-head', '.ui-btn-right']);
                    spot_view.$el.trigger('create');
                    spot_view.fetch_photos();
                    spot_view.fetch_users();
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

        spot_view.photos.fetch({data: data});
    },

    render_photos: function(){
        var spot_view = this;
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

            var el = this.$('.image-streams');
            el.append( stream_li.el );
            stream_li.render();
            el.trigger('create');
        }
    },

    fetch_users: function () {
        this.top_users.get_top_users(spot_view.spot_id);
    },

    render_top_users: function(){
        // Don't show if only 1 user as this is the hero
        if(this.top_users.length > 1){
            this.replace_from_template({top_users: this.top_users}, [".top-users"]);
            this.$(".top-users").trigger('create');
        }
    }
});

return spot_view;

});
