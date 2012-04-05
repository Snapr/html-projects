snapr.views.feed = Backbone.View.extend({

    events: {
        "click .x-load-more": "more",
        "change .feed-view-toggle": "feed_view_toggle"
    },

    initialize: function()
    {
        _.bindAll( this );
        this.query = this.options.query || {};

        if (this.query.photo_id)
        {
            this.back = "Back";
        }
        else if (this.query.username)
        {
            this.back = this.query.username;
        }
        else if (this.query.keywords)
        {
            this.back = this.feed_parameter;
        }
        else if (this.query.area)
        {
            this.back = "Location";
        }
        else if (this.query.favorited_by)
        {
            this.back = "Favorites";
        }
        else if (this.query.spot && this.query.venue_name)
        {
            this.back = "Spot";
        }
        else
        {
            this.back = "Feed";
        }

        var list_style = this.query.list_style || 'list';

        var toggle_container = this.el.find( ".feed-view-toggle" );
        toggle_container.find( "input[type='radio']" ).attr( "checked", false );

        if (list_style == 'grid')
        {
            this.el.find(".feed-content").addClass("grid");
            toggle_container.find("#feed-view-grid").attr( "checked", true );
        }
        else
        {
            this.el.find(".feed-content").removeClass("grid");
            toggle_container.find("#feed-view-list").attr( "checked", true );
        }


        if (this.query.username)
        {
            this.feed_header = new snapr.views.user_header({
                username: this.query.username,
                model: new snapr.models.user( {username: this.query.username} ),
                el: this.el.find(".feed-header").empty()
            });
        }
        else
        {
            this.feed_header = new snapr.views.feed_header({
                query_data: this.query,
                el: this.el.find(".feed-header").empty()
            });
        }

        this.pending_uploads = {};

        var feed_view = this;

        feed_view.el.find(".feed-upload-list").empty();
        feed_view.el.find('#feed-images').empty();

        this.el.live( 'pageshow', function()
        {
            toggle_container.find( "input[type='radio']" ).checkboxradio( "refresh" );

        });

        this.el.live('pagehide', function( e )
        {
            // var photoSwipeInstance = Code.PhotoSwipe.getInstance( 'feed' );
            //
            // if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null)
            // {
            //     Code.PhotoSwipe.detatch(photoSwipeInstance);
            // }

            $(e.target).undelegate();

            return true;
        });

        // if we are coming from the map view do a flip, otherwise do a slide transition
        if ($.mobile.activePage.attr('id') == 'map' )
        {
            var transition = "flip";
        }
        else
        {
            var transition = "none";
        }

        snapr.utils.set_header_back_btn_text( this.el, this.query.back );

        $.mobile.changePage( $("#feed"), {
            changeHash: false,
            transition: transition
        });

        this.photo_collection = new snapr.models.photo_collection();
        this.photo_collection.url = snapr.api_base + "/search/";
        this.photo_collection.data = this.query;
        this.photo_collection.data.n = snapr.constants.feed_count;
        this.photo_collection.data.list_style && delete this.photo_collection.data.list_style;

        this.more_button(false);

        this.populate_feed();
    },

    photoswipe_init: function()
    {
        // detach the previous photoswipe instance if it exists
        var photoSwipeInstance = Code.PhotoSwipe.getInstance( 'feed' );

        if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance !== null)
        {
            Code.PhotoSwipe.detatch(photoSwipeInstance);
        }

        if ($( "#feed-images a.gallery_link", this.el ).length)
        {
            // make sure we set the param backButtonHideEnabled:false to prevent photoswipe from changing the hash
            photoSwipeInstance = $( "#feed-images a.gallery_link", this.el )
                .photoSwipe( {
                    backButtonHideEnabled: false,
                    preventSlideshow: true,
                    captionAndToolbarFlipPosition: true,
                    allowUserZoom: false
                }, 'feed' );
        }


        $.mobile.hidePageLoadingMsg();
    },

    populate_feed: function( additional_data )
    {

        var list_style = this.el.find("#feed-view-grid").is(":checked") && 'grid' || 'list';

        console.log('populate feed list style', list_style);

        if (this.feed_list)
        {
            this.feed_list.list_style = list_style;
        }

        var feed_view = this;
        var options = {
            success: function( collection, response )
            {
                feed_view.feed_list = new snapr.views.feed_list({
                    el: feed_view.el.find('#feed-images').eq(0),
                    collection: feed_view.photo_collection,
                    list_style: list_style,
                    back: feed_view.back
                });

                feed_view.feed_list.render( feed_view.photoswipe_init );
                $.mobile.hidePageLoadingMsg();
                feed_view.more_button(
                    response.response &&
                    response.response.photos &&
                    response.response.photos.length == feed_view.photo_collection.data.n );
            },
            error:function()
            {
                console.log('error');
                $.mobile.hidePageLoadingMsg();
            }
        }

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
            $(this.el).find(".v-feed-more").html( $("#feed-more-button").html() ).trigger( "create" );
        }
        else
        {
            $(this.el).find(".v-feed-more").empty().trigger( "create" );
        }
    },

    more: function()
    {
        var data = this.photo_collection.data;

        data.photo_id && delete data.photo_id;
        data.paginate_from = this.photo_collection.last().get('id');

        this.populate_feed( data );
        // console.log( 'more', this.photo_collection.data );
    },

    feed_view_toggle: function(e)
    {
        var input_target = $('#' + e.target.id);
        var list_style = input_target.val();

        var container = input_target.closest( ".feed-view-toggle" );
        container.find( "input[type='radio']" ).attr( "checked", false );
        input_target.attr( "checked", true );
        container.find( "input[type='radio']" ).checkboxradio( "refresh" );

        if (list_style == "list")
        {
            this.el.find(".feed-content").removeClass("grid").trigger("refresh");
        }
        else
        {
            this.el.find(".feed-content").addClass("grid").trigger("refresh");
        }

        this.feed_list.list_style = list_style;
        this.feed_list.render( this.photoswipe_init );
    },

    upload_progress: function( upload_data )
    {
        var feed_view = this;

        feed_view.el.find(".feed-upload-list").empty();

        var upload_li_template = _.template( $("#upload-progress-li-template").html() );

        _.each( upload_data.uploads, function( photo )
        {
            feed_view.pending_uploads[photo.id] = new snapr.views.upload_progress_li({
                template: upload_li_template,
                photo: photo
            });
            feed_view.el.find(".feed-upload-list").append( feed_view.pending_uploads[photo.id].render().el );
        })

        feed_view.el.find(".feed-upload-list").listview().listview("refresh");

    },

    upload_completed: function( queue_id, snapr_id )
    {
        // if we are on a feed for the current snapr user
        if (this.options.query.username == snapr.auth.get("snapr_user")
            && !this.options.query.photo_id)
        {
            // remove the date restriction if it is present
            if (this.photo_collection.data.max_date)
            {
                delete this.photo_collection.data.max_date;
            }
            // refresh the feed content
            this.populate_feed();
        }
    }

})
// snapr.views.feed = Backbone.View.extend({
//
//     initialize: function()
//     {
//         _.bindAll( this );
//
//         var this.query = this.options.query;
//
//         this.list_style = this.query.list_style || 'list';
//
//         var feed_view = this;
//
//         feed_view.el.find('#feed-images').empty();
//
//
//         var toggle_container = this.el.find( ".feed-view-toggle" );
//         toggle_container.find( "input[type='radio']" ).attr( "checked", false );
//
//         this.el.live( 'pageshow', function()
//         {
//             toggle_container.find( "input[type='radio']" ).checkboxradio( "refresh" );
//
//         });
//
//         // photoSwipe gallery view setup (disabled)
//
//         this.el.live('pagehide', function( e )
//         {
//             var photoSwipeInstance = Code.PhotoSwipe.getInstance( 'feed' );
//
//             if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null)
//             {
//                 Code.PhotoSwipe.detatch(photoSwipeInstance);
//             }
//
//             $(e.target).undelegate();
//
//             return true;
//         });
//
//         // if we are coming from the map view do a flip, otherwise do a slide transition (disabled)
//
//         if ($.mobile.activePage.attr('id') == 'map' )
//         {
//             var transition = "flip";
//         }
//         else
//         {
//             var transition = "slide";
//         }
//
//         this.photo_collection = new snapr.models.photo_collection();
//         this.photo_collection.additional_data = false;
//         this.photo_collection.url = snapr.api_base + "/search/";
//         this.photo_collection.data = this.query;
//         this.photo_collection.data.list_style && delete this.photo_collection.data.list_style;
//         this.populate_feed();
//
//         var transition = "slide";
//         $.mobile.changePage( $("#feed"), {
//             changeHash: false,
//             transition: transition
//         });
//
//         this.el.find(".load-more").hide();
//     },
//
//     events: {
//         "click button.more": "more",
//         "change .feed-view-toggle": "feed_view_toggle"
//     },
//
//
//     photoswipe_init: function()
//     {
//         // detach the previous photoswipe instance if it exists
//         var photoSwipeInstance = Code.PhotoSwipe.getInstance( 'feed' );
//
//         if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null)
//         {
//             Code.PhotoSwipe.detatch(photoSwipeInstance);
//         }
//
//         if ($( "#feed-images a.gallery_link", this.el ).length)
//         {
//             // make sure we set the param backButtonHideEnabled:false to prevent photoswipe from changing the hash
//             var photoSwipeInstance = $( "#feed-images a.gallery_link", this.el )
//                 .photoSwipe( {
//                     backButtonHideEnabled: false
//                 }, 'feed' );
//         }
//
//
//         $.mobile.hidePageLoadingMsg();
//     },
//
//
//     populate_feed: function( additional_data )
//     {
//
//         var list_style = this.list_style;
//
//         var feed_view = this;
//         var scrollY = window.scrollY;
//         var options = {
//             success: function()
//             {
//                 feed_view.feed_list = new snapr.views.feed_list({
//                     collection: feed_view.photo_collection,
//                     list_style: list_style
//                 });
//                 $(feed_view.el).find("[data-role='content']").html( feed_view.feed_list.render().el );
//                 $(feed_view.el).find(".gallery").listview().listview("refresh")
//                 $(feed_view.el).find(".more").button("enable");
//                 $(feed_view.el).find(".load-more").show();
//                 window.scrollTo(0,scrollY);
//                 spinner_stop();
//             },
//             error:function()
//             {
//                 console.log('error');
//                 $(feed_view.el).find(".load-more").hide();
//                 spinner_stop();
//             }
//         }
//
//         if (additional_data)
//         {
//             options.add = true;
//             this.photo_collection.data = $.extend(this.photo_collection.data, additional_data);
//         }
//
//         spinner_start();
//
//         this.photo_collection.fetch( options );
//
//     },
//
//     more: function()
//     {
//         $(this.el).find(".more").button("disable");
//
//         var data = this.photo_collection.data;
//
//         data.photo_id && delete data.photo_id;
//
//         if (this.photo_collection.last())
//         {
//             if (this.photo_collection.additional_data)
//             {
//                 data.max_date = this.photo_collection.last().get('date');
//             }
//         }
//         else
//         {
//             // no photos in collection
//             return false;
//         }
//
//         this.populate_feed( data );
//         // console.log( 'more', this.photo_collection.data );
//     },
//
//     feed_view_toggle: function(e)
//     {
//         var input_target = $('#' + e.target.id);
//         var list_style = input_target.val();
//
//         var container = input_target.closest( ".feed-view-toggle" );
//         container.find( "input[type='radio']" ).attr( "checked", false );
//         input_target.attr( "checked", true );
//         container.find( "input[type='radio']" ).checkboxradio( "refresh" );
//
//         if (list_style == "list")
//         {
//             this.el.find(".feed-content").removeClass("grid").trigger("refresh");
//         }
//         else
//         {
//             this.el.find(".feed-content").addClass("grid").trigger("refresh");
//         }
//
//         this.feed_list.list_style = list_style;
//         this.feed_list.render( this.photoswipe_init );
//     },
//
//     // upload_progress: function( upload_data )
//     // {
//     //     var feed_view = this;
//     //
//     //     feed_view.el.find(".feed-upload-list").empty();
//     //
//     //     var upload_li_template = _.template( $("#upload-progress-li-template").html() );
//     //
//     //     _.each( upload_data.uploads, function( photo )
//     //     {
//     //         feed_view.pending_uploads[photo.id] = new snapr.views.upload_progress_li({
//     //             template: upload_li_template,
//     //             photo: photo
//     //         });
//     //         feed_view.el.find(".feed-upload-list").append( feed_view.pending_uploads[photo.id].render().el );
//     //     })
//     //
//     //     feed_view.el.find(".feed-upload-list").listview().listview("refresh");
//     //
//     // },
//
//     // upload_completed: function( queue_id, snapr_id )
//     // {
//     //     // if we are on a feed for the current snapr user
//     //     if (this.options.query.username == snapr.auth.get("snapr_user")
//     //         && !this.options.query.photo_id)
//     //     {
//     //         // remove the date restriction if it is present
//     //         if (this.photo_collection.data.max_date)
//     //         {
//     //             delete this.photo_collection.data.max_date;
//     //         }
//     //         // refresh the feed content
//     //         this.populate_feed();
//     //     }
//     // }
//
// })
