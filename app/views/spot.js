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


        this.$('.x-header').empty();
        this.$('.x-image-streams').empty();
        this.$('.x-top-users').empty();

        this.spot_id = options.query.spot_id || 0;
        this.change_page();

        $.mobile.showPageLoadingMsg();
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
        this.replace_from_template({spot:this.model}, ['.x-header', '.ui-btn-right']);
        this.$el.trigger('create');
        $.mobile.hidePageLoadingMsg();
    },

    fetch_photos: function () {
        var this_view = this;
        var stream_li = new side_scroll({
            collection: new photo_collection([], {
                data: {
                    sort: 'weighted_score',
                    spot: this.spot_id
                },
                exclude: this.model.get('info').hero_image && [this.model.get('info').hero_image.id]
            }),
            initial_title: '', // initially blank until we know if it shoule be 'popular' or 'nearby'
            title: "popular",
            expand: true,
            parent_view: this,
            use_gallery: false,
            no_photos: function(){

                this.title = 'nearby';

                // remove this callback, not useful more than once
                this.no_photos = false;

                this.collection.data.latitude = this_view.model.get('location').latitude;
                this.collection.data.longitude = this_view.model.get('location').longitude;
                this.collection.data.radius = config.get('nearby_radius');
                delete this.collection.data.spot;

                this.fetch();

                return true;
            }
        });

        var el = this.$('.x-image-streams');
        el.append( stream_li.el );
        stream_li.render();
        el.trigger('create');

    },

    fetch_users: function () {
        this.top_users.get_top_users(this.spot_id);
    },

    render_top_users: function(){
        // Don't show if only 1 user as this is the hero
        if(this.top_users.length > 1){
            this.replace_from_template({top_users: this.top_users}, [".x-top-users"]);
            this.$(".x-top-users").trigger('create');
        }
    }
});

return spot_view;

});
