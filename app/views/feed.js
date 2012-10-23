/*global _  define require */
define(['config', 'views/base/page', 'models/user', 'views/user_header', 'views/feed_header',
    'collections/photo', 'views/feed_list', 'utils/photoswipe', 'views/upload_progress_li', 'collections/upload_progress',  'auth', 'views/components/paused'],
function(config, page_view, user_model, user_header, feed_header, photo_collection,
    feed_list, photoswipe, upload_progress_li, upload_progress, auth, paused_el){

return page_view.extend({

    post_initialize: function(){
        var feed_view = this;
        this.$el.on( "pageshow", function(){
            feed_view.$( ".x-feed-view-toggle input[type='radio']" ).checkboxradio( "refresh" );
            feed_view.watch_uploads();
        });
        this.$el.on( "pagehide", function(){
            feed_view.watch_uploads(false);
            feed_view.$('.x-activity').hide();
        });
        config.on('change:paused', function(){
            if(config.get('paused')){
                feed_view.$(".x-feed-upload-list").prepend(paused_el).trigger("create");
            }else{
                $('.x-resume-queue').remove();
            }
        });
    },

    post_activate: function(options){
        this.more_button(false);

        this.photo_collection = new photo_collection();
        this.photo_collection.url = config.get('api_base') + "/search/";

        this.query = this.options.query || {};

        if (this.query.photo_id){
            this.title = "Back";
        }else if (this.query.username){
            this.title = 'Feed';
        }else if (this.query.keywords){
            this.title = this.feed_parameter;
        }else if (this.query.area){
            this.title = "Location";
        }else if (this.query.favorited_by){
            this.title = "Favorites";
        }else if (this.query.spot && this.query.venue_name){
            this.title = "Spot";
        }else{
            this.title = "Feed";
        }

        var list_style = this.query.list_style || 'list';

        var toggle_container = this.$( ".x-feed-view-toggle" );
        toggle_container.find( "input[type='radio']" ).attr( "checked", false );

        if (list_style == 'grid'){
            this.$(".feed-content").addClass("grid");
            toggle_container.find(".x-grid").attr( "checked", true );
        }else{
            this.$(".feed-content").removeClass("grid");
            toggle_container.find(".x-list").attr( "checked", true );
        }


        if (this.query.username){
            var this_view = this;
            var user = new user_model( {username: this.query.username} );
            user.on('change', function(){
                this_view.title = user.get('display_username');
            });
            this.feed_header = new user_header({
                username: this.query.username,
                model: user,
                el: this.$(".x-feed-header").empty()[0]
            });
        }else{
            this.feed_header = new feed_header({
                query_data: this.query,
                el: this.$(".x-feed-header").empty()[0]
            });
        }

        this.$el.toggleClass('x-my-snaps', this.is_my_snaps());
        this.$('.x-activity').toggle(this.is_my_snaps());

        this.$el.removeClass("x-showing-upload-queue");
        this.$(".x-feed-upload-list").empty();

        this.$(".x-feed-upload-list").empty();
        this.$('.x-feed-images').empty();

        this.change_page();

        if(this.query.date){
            this.query.date = this.query.date.replace('+', ' ');
        }
        this.photo_collection.data = this.query;
        this.photo_collection.data.n = this.photo_collection.data.n || config.get('feed_count');
        this.photo_collection.data.detail = 2;
        if(this.photo_collection.data.list_style){ delete this.photo_collection.data.list_style; }

        this.populate_feed();
        this.update_uploads();
    },

    events: {
        "click .x-load-more": "more",
        "change .x-feed-view-toggle": "feed_view_toggle"
    },

    is_my_snaps: function(){ return auth.has("snapr_user") && auth.get("snapr_user") == this.options.query.username; },

    get_default_tab: function(){ return this.is_my_snaps() && 'feed' || 'discover'; },

    photoswipe_init: function(){ $( ".x-gallery-link", this.el ).photoswipe_init('feed'); },

    populate_feed: function( additional_data ){

        var list_style = this.$(".x-feed-view-toggle .x-grid").is(":checked") && 'grid' || 'list';

        if (this.feed_list){
            this.feed_list.list_style = list_style;
        }

        var feed_view = this;
        var options = {
            success: function( collection, response ){
                if(collection.length){
                    feed_view.feed_list = new feed_list({
                        el: feed_view.$('.x-feed-images')[0],
                        collection: feed_view.photo_collection,
                        list_style: list_style
                    });
                    feed_view.photo_collection.on('remove', feed_view.photoswipe_init);

                    feed_view.feed_list.render( feed_view.photoswipe_init );
                    $.mobile.hidePageLoadingMsg();
                    feed_view.$( ".x-feed-more" ).show();
                    feed_view.more_button(
                        !feed_view.photo_collection.data.n || (
                            response.response &&
                            response.response.photos &&
                            response.response.photos.length >= feed_view.photo_collection.data.n )
                        );
                }else{
                    feed_view.feed_list = new feed_list({
                        el: feed_view.$('.x-feed-images')[0],
                        collection: feed_view.photo_collection,
                        list_style: list_style
                    });
                    feed_view.feed_list.render();
                    $.mobile.hidePageLoadingMsg();
                }
            },
            error:function(){
                console.log('error');
                $.mobile.hidePageLoadingMsg();
            }
        };

        if (additional_data){
            options.add = true;
            this.photo_collection.data = $.extend(this.photo_collection.data, additional_data);
        }

        $.mobile.loadingMessage = "Loading";
        $.mobile.showPageLoadingMsg();

        this.photo_collection.fetch( options );
    },

    more_button: function( more_photos ){
        if (more_photos){
            this.$(".x-feed-more").children().show();
        }else{
            this.$(".x-feed-more").children().hide();
        }
    },

    more: function(){
        var data = this.photo_collection.data;

        data.n = config.get('feed_count');
        data.paginate_from = this.photo_collection.last().get('id');

        this.populate_feed( data );
    },

    feed_view_toggle: function(e){
        var input_target = $('#' + e.target.id);
        var list_style = input_target.val();

        var container = input_target.closest( ".x-feed-view-toggle" );
        container.find( "input[type='radio']" ).attr( "checked", false );
        input_target.attr( "checked", true );
        container.find( "input[type='radio']" ).checkboxradio( "refresh" );

        this.$(".x-feed-content").toggleClass("x-grid", list_style != "list").trigger("refresh");
        this.feed_list.list_style = list_style;
        this.feed_list.render( this.photoswipe_init );
    },

    watch_uploads: function(on){
        if(on !== false){
            upload_progress.on('add', this.update_uploads);
            upload_progress.on('complete', this.upload_complete);
        }else{
            upload_progress.off('add', this.update_uploads);
            upload_progress.off('complete', this.upload_complete);
        }
    },

    update_uploads: function(model, changes){
        if (this.is_my_snaps()){

            var upload_li_template = this.get_template('components/feed/upload_progress');

            // reverse models - newest last
            _.each(model && [model] || upload_progress.models.slice().reverse(), function( photo ){
                var li =  new upload_progress_li({
                    template: upload_li_template,
                    photo: photo
                });
                this.$(".x-feed-upload-list").prepend( li.render().el );
            }, this);

            if (upload_progress.models.length){
                this.$el.addClass("x-showing-upload-queue");
            }

            this.$(".x-feed-upload-list").listview().listview("refresh");
        }
    },

    upload_complete: function( model, queue_id ){
        this.$(".x-upload-id-" + model.id).remove();
        // if we are on a feed for the current snapr user
        if (this.is_my_snaps() && !this.options.query.photo_id){
            // remove the date restriction if it is present
            if (this.photo_collection.data.max_date){
                delete this.photo_collection.data.max_date;
            }
            // refresh the feed content
            this.populate_feed();
        }
    }

});

});
