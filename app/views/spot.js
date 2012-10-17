/*global _  define require */
define(['views/base/view', 'views/base/page', 'models/spot', 'views/base/side_scroll', 'collections/photo', 'collections/user', 'utils/geo', 'config'],
function(view, page_view, spot_model, side_scroll, photo_collection, users_collection, geo, config){

var spot_view = page_view.extend({

    post_initialize: function() {
        this.top_users = new users_collection();
        this.top_users.on('all', this.render_top_users);

        this.photos = new photo_collection();
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
                    spot_view.render();
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

    render: function(){
        this.replace_from_template({spot:this.model}, ['.spot-head', '.ui-btn-right']);
        this.$el.trigger('create');

        this.render_popular_nearby();
    },

    render_popular_nearby: function(){
        var data = {
            n: 6,
            sort: 'weighted_score',
            nearby: true,
            radius: 1000,
            latitude: this.model.get('location').latitude,
            longitude: this.model.get('location').longitude
        };

        var stream_li = new side_scroll({
            collection: new photo_collection([], {data: data}),
            title: "popular nearby"
        });

        var el = this.$('.image-streams');
        el.append( stream_li.el );
        stream_li.render();
        el.trigger('create');
    },

    fetch_photos: function () {
        var spot_view = this;
        // Spot has more than 1 photos (Hero is the first photo)
        if (this.model.get('stats').photos_count > 1) {
            this.photos.fetch({
                data: {
                    n: 6,
                    sort: 'weighted_score',
                    spot: this.spot_id
                },
                success: function(){

                    // filter hero image
                    if(spot_view.model.get('info').hero_image !== null){
                        var hero_id = spot_view.model.get('info').hero_image.id;
                        spot_view.photos = new photo_collection(spot_view.photos.filter(function (model) {
                            return model.get('id') !== hero_id;
                        }));
                    }

                    if (spot_view.photos.length > 0) {
                        var stream_li = new side_scroll({
                            collection: spot_view.photos,
                            title: "popular",
                            expand: true
                        });

                        var el = spot_view.$('.image-streams');
                        el.prepend( stream_li.el );
                        stream_li.render();
                        el.trigger('create');
                    }
                }
            });
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
