/*global _  define require */
define(['config', 'views/base/page', 'models/user', 'views/user_header', 'views/feed_header',
    'collections/photo', 'views/feed_list', 'utils/photoswipe',
    'views/upload_progress_li', 'auth'],
function(config, page_view, user_model, user_header, feed_header, photo_collection,
    feed_list, photoswipe, upload_progress_li, auth){

return page_view.extend({

    post_activate: function(options){
        this.options = options;
        this.photo_collection = new photo_collection();
        this.photo_collection.url = config.get('api_base') + "/search/";

        this.query = this.options.query || {};

        if (this.query.photo_id){
            this.title = "Back";
        }else if (this.query.username){
            this.title = this.query.username;
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

        var toggle_container = this.$el.find( ".feed-view-toggle" );
        toggle_container.find( "input[type='radio']" ).attr( "checked", false );

        if (list_style == 'grid'){
            this.$el.find(".feed-content").addClass("grid");
            toggle_container.find("#feed-view-grid").attr( "checked", true );
        }
        else{
            this.$el.find(".feed-content").removeClass("grid");
            toggle_container.find("#feed-view-list").attr( "checked", true );
        }


        if (this.query.username){
            this.feed_header = new user_header({
                username: this.query.username,
                model: new user_model( {username: this.query.username} ),
                el: this.$el.find(".feed-header").empty()[0]
            });
        }else{
            this.feed_header = new feed_header({
                query_data: this.query,
                el: this.$el.find(".feed-header").empty()[0]
            });
        }

        this.pending_uploads = {};
        this.$el.removeClass("showing-upload-queue");
        this.$el.find(".feed-upload-list").empty();

        var feed_view = this;

        this.$el.find(".feed-upload-list").empty();
        this.$el.find('#feed-images').empty();

        this.$el.on( "pageshow", function(){
            toggle_container.find( "input[type='radio']" ).checkboxradio( "refresh" );

        });

        // if we are coming from the map view do a flip, otherwise do a slide transition
        var transition = ($.mobile.activePage.attr('id') == 'map') ? "flip" : "none";
        this.change_page({
            transition: transition
        });

        if(this.query.date){
            this.query.date = this.query.date.replace('+', ' ');
        }
        this.photo_collection.data = this.query;
        this.photo_collection.data.n = this.photo_collection.data.n || config.get('feed_count');
        this.photo_collection.data.detail = 2;
        this.photo_collection.data.list_style && delete this.photo_collection.data.list_style;

        this.more_button(false);

        this.populate_feed();

        // test data
        // var test_data={uploads:[{id:5345233,thumbnail:"http://media-server2.snapr.us/sml/dev/b1329ff1029c2a686ad78b94a66eea76/Z4K.jpg",upload_status:"active",percent_complete:50,status:"public",description:"Here's a cool photo of stuff!",location:{latitude:51.553978,location:"New York",longitude:-0.076529},date:"2011-04-12 20:50:10 +0100",shared:{tweeted:!0,facebook_newsfeed:!0,foursquare_checkin:!0,tumblr:!0,venue_id:123,venue_name:"some bar",venue_source:"Foursquare"}},{id:5345234,thumbnail:"http://media-server2.snapr.us/sml/247f51a82ca7abb2adf0228b390010ef/2BD4.jpg",
        // upload_status:"waiting",percent_complete:0,status:"private",description:"test2",location:{latitude:51.553978,location:"New York",longitude:-0.076529},date:"2011-04-12 20:50:10 +0100",shared:{tweeted:!0,facebook_newsfeed:!0,foursquare_checkin:!0,tumblr:!0,venue_id:123,venue_name:"some bar",venue_source:"Foursquare"}}]};setTimeout(function(){console.log("testing 1",test_data);test_data.uploads[0].percent_complete=40;upload_progress(test_data)},3E3);
        // setTimeout(function(){console.log("testing 2",test_data);test_data.uploads[0].percent_complete=60;upload_progress(test_data)},6E3);setTimeout(function(){console.log("testing 3",test_data);test_data.uploads[0].percent_complete=100;upload_progress(test_data)},8E3);setTimeout(function(){console.log("testing 4",test_data);test_data.uploads[0].percent_complete=100;upload_progress(test_data)},12E3);setTimeout(function(){console.log("testing 5");upload_completed(5345233,"Z4K")},14E3);
        // setTimeout(function(){console.log("testing 3",test_data);test_data.uploads.shift();test_data.uploads[0].percent_complete=50;upload_progress(test_data)},9E3);setTimeout(function(){console.log("testing 4",test_data);test_data.uploads[0].percent_complete=100;upload_progress(test_data)},12E3);setTimeout(function(){console.log("testing 5",test_data);test_data.uploads.shift();upload_progress(test_data)},14E3);
    },

    events: {
        "click .x-load-more": "more",
        "change .feed-view-toggle": "feed_view_toggle"
    },

    photoswipe_init: function(){ $( "#feed-images a.gallery_link", this.el ).photoswipe_init('feed'); },

    populate_feed: function( additional_data )
    {

        var list_style = this.$el.find("#feed-view-grid").is(":checked") && 'grid' || 'list';

        if (this.feed_list){
            this.feed_list.list_style = list_style;
        }

        var feed_view = this;
        var options = {
            success: function( collection, response )
            {
                if(collection.length){
                    feed_view.feed_list = new feed_list({
                        el: feed_view.$el.find('#feed-images')[0],
                        collection: feed_view.photo_collection,
                        list_style: list_style
                    });

                    feed_view.feed_list.render( feed_view.photoswipe_init );
                    $.mobile.hidePageLoadingMsg();
                    feed_view.more_button(
                        !feed_view.photo_collection.data.n || (
                            response.response &&
                            response.response.photos &&
                            response.response.photos.length >= feed_view.photo_collection.data.n )
                        );
                }else{
                    feed_view.feed_list = new feed_list({
                        el: feed_view.$el.find('#feed-images')[0],
                        collection: feed_view.photo_collection,
                        list_style: list_style
                    });
                    feed_view.feed_list.render();
                    $.mobile.hidePageLoadingMsg();
                }
            },
            error:function()
            {
                console.log('error');
                $.mobile.hidePageLoadingMsg();
            }
        };

        if (additional_data)
        {
            options.add = true;
            this.photo_collection.data = $.extend(this.photo_collection.data, additional_data);
        }

        $.mobile.loadingMessage = "Loading";
        $.mobile.showPageLoadingMsg();

        this.photo_collection.fetch( options );
    },

    more_button: function( more_photos )
    {
        if (more_photos)
        {
            this.$el.find(".v-feed-more").html( $("#feed-more-button").html() ).trigger( "create" );
        }
        else
        {
            this.$el.find(".v-feed-more").empty().trigger( "create" );
        }
    },

    more: function()
    {
        var data = this.photo_collection.data;

        data.n = config.get('feed_count');
        data.paginate_from = this.photo_collection.last().get('id');

        this.populate_feed( data );
    },

    feed_view_toggle: function(e)
    {
        var input_target = $('#' + e.target.id);
        var list_style = input_target.val();

        var container = input_target.closest( ".feed-view-toggle" );
        container.find( "input[type='radio']" ).attr( "checked", false );
        input_target.attr( "checked", true );
        container.find( "input[type='radio']" ).checkboxradio( "refresh" );

        this.$el.find(".feed-content").toggleClass("grid", list_style != "list").trigger("refresh");
        this.feed_list.list_style = list_style;
        this.feed_list.render( this.photoswipe_init );
    },

    upload_progress: function( upload_data )
    {
        if (auth.has("snapr_user") && auth.get("snapr_user") == this.query.username)
        {
            this.$el.find(".feed-upload-list").empty();

            var upload_li_template = _.template( $("#feed-upload-progress-li-template").html() );

            _.each( upload_data.uploads, function( photo )
            {
                this.pending_uploads[photo.id] = new upload_progress_li({
                    template: upload_li_template,
                    photo: photo
                });
                this.$el.find(".feed-upload-list").append( this.pending_uploads[photo.id].render().el );
            }, this);

            if (upload_data.uploads)
            {
                this.$el.addClass("showing-upload-queue");
            }

            this.$el.find(".feed-upload-list").listview().listview("refresh");
        }

    },

    upload_completed: function( queue_id, snapr_id )
    {
        this.$el.find(".upload-id-" + queue_id).remove();
        // if we are on a feed for the current snapr user
        if (this.options.query.username == auth.get("snapr_user") && !this.options.query.photo_id){
            // remove the date restriction if it is present
            if (this.photo_collection.data.max_date){
                delete this.photo_collection.data.max_date;
            }
            // refresh the feed content
            this.populate_feed();
        }
    },

    upload_count: function( count )
    {
        if (count)
        {
            this.$el.addClass("showing-upload-queue");
        }
        else
        {
            this.$el.removeClass("showing-upload-queue");
        }
    }

});

});
