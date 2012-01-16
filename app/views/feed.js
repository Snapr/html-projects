snapr.views.feed = Backbone.View.extend({

    events: {
        "click button.more": "more",
        // "change .feed-view-toggle": "feed_view_toggle"
    },

    initialize: function()
    {

        var query_data = this.options.query;

        var list_style = query_data.list_style || 'list';

        var feed_view = this;

        this.el.find('ul.gallery').empty();

        // this.el.live( 'pageshow', function()
        // {
        //     toggle_container.find( "input[type='radio']" ).checkboxradio( "refresh" );
        // 
        // });

        // photoSwipe gallery view setup (disabled)

        // this.el.live('pagehide', function( e )
        // {
        //     var photoSwipeInstance = Code.PhotoSwipe.getInstance( 'feed' );
        // 
        //     if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null)
        //     {
        //         Code.PhotoSwipe.detatch(photoSwipeInstance);
        //     }
        //     
        //     $(e.target).undelegate();
        //     
        //     return true; 
        // });

        // if we are coming from the map view do a flip, otherwise do a slide transition (disabled)

        // if ($.mobile.activePage.attr('id') == 'map' )
        // {
        //     var transition = "flip";
        // }
        // else
        // {
        // }
        
        if (query_data.pink_hearts)
        {
            $(this.el).find("h1").text("Pink Hearts");
            this.pink = true;
            this.photo_collection = new snapr.models.pink_photo_collection();
            this.photo_collection.url = "http://pink.victoriassecret.com/services/hearts/image_json.jsp";
            this.photo_collection.data = {most_recent: true};
            this.photo_collection.data.page_number = 1
            this.populate_feed();
        }
        else
        {
            $(this.el).find("h1").text("Featured Girls");
            this.pink = false;
            this.photo_collection = new snapr.models.photo_collection();
            this.photo_collection.url = snapr.api_base + "/search/";
            this.photo_collection.data = query_data;
            this.photo_collection.data.n = snapr.constants.feed_count;
            if (snapr.app_group)
            {
                this.photo_collection.data.app_group = snapr.app_group;
            }
            this.photo_collection.data.list_style && delete this.photo_collection.data.list_style;
            this.populate_feed();
        }
        
        var transition = "slide";
        $.mobile.changePage( $("#feed"), {
            changeHash: false,
            transition: transition
        });
        
    },
    
    // photoswipe_init: function()
    // {
    //     // detach the previous photoswipe instance if it exists
    //     var photoSwipeInstance = Code.PhotoSwipe.getInstance( 'feed' );
    // 
    //     if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null)
    //     {
    //         Code.PhotoSwipe.detatch(photoSwipeInstance);
    //     }
    // 
    //     if ($( "ul.gallery a.gallery_link", this.el ).length)
    //     {
    //         // make sure we set the param backButtonHideEnabled:false to prevent photoswipe from changing the hash
    //         var photoSwipeInstance = $( "ul.gallery a.gallery_link", this.el )
    //             .photoSwipe( {
    //                 backButtonHideEnabled: false
    //             }, 'feed' );
    //     }
    //     
    // 
    //     $.mobile.hidePageLoadingMsg();
    // },
    // 

    populate_feed: function( additional_data )
    {
        
        var list_style = this.pink ? "pink": "list";
        
        var feed_view = this;
        var options = {
            success: function()
            {
                feed_view.feed_list = new snapr.views.feed_list({
                    el: feed_view.el.find('ul.gallery').eq(0),
                    collection: feed_view.photo_collection,
                    list_style: list_style
                });

                feed_view.feed_list.render( feed_view.photoswipe_init );
                $.mobile.hidePageLoadingMsg();
            },
            error:function()
            {
                console.warn('error');
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
        
        if (this.pink)
        {
            options.dataType = "json";
        }
        this.photo_collection.fetch( options );

    },
    
    more: function()
    {
        var data = this.photo_collection.data;
        
        if (this.pink)
        {
            this.photo_collection.data.page_number++;
        }
        else
        {
            data.photo_id && delete data.photo_id;
            
            if (this.photo_collection.last())
            {
                data.max_date = this.photo_collection.last().get('date');
            }
            else
            {
                // no photos in collection
                return false;
            }
        }

        this.populate_feed( data );
        // console.warn( 'more', this.photo_collection.data );
    },
    
    // feed_view_toggle: function(e)
    // {
    //     var input_target = $('#' + e.target.id);
    //     var list_style = input_target.val();
    //     
    //     var container = input_target.closest( ".feed-view-toggle" );
    //     container.find( "input[type='radio']" ).attr( "checked", false );
    //     input_target.attr( "checked", true );
    //     container.find( "input[type='radio']" ).checkboxradio( "refresh" );
    //     
    //     if (list_style == "list")
    //     {
    //         this.el.find(".feed-content").removeClass("grid").trigger("refresh");
    //     }
    //     else
    //     {
    //         this.el.find(".feed-content").addClass("grid").trigger("refresh");
    //     }
    //     
    //     this.feed_list.list_style = list_style;
    //     this.feed_list.render( this.photoswipe_init );
    // },
    
    // upload_progress: function( upload_data )
    // {
    //     var feed_view = this;
    // 
    //     feed_view.el.find(".feed-upload-list").empty();
    //     
    //     var upload_li_template = _.template( $("#upload-progress-li-template").html() );
    //     
    //     _.each( upload_data.uploads, function( photo )
    //     {
    //         feed_view.pending_uploads[photo.id] = new snapr.views.upload_progress_li({
    //             template: upload_li_template,
    //             photo: photo
    //         });
    //         feed_view.el.find(".feed-upload-list").append( feed_view.pending_uploads[photo.id].render().el );
    //     })
    //     
    //     feed_view.el.find(".feed-upload-list").listview().listview("refresh");
    //     
    // },
    
    // upload_completed: function( queue_id, snapr_id )
    // {
    //     // if we are on a feed for the current snapr user
    //     if (this.options.query.username == snapr.auth.get("snapr_user")
    //         && !this.options.query.photo_id)
    //     {
    //         // remove the date restriction if it is present
    //         if (this.photo_collection.data.max_date)
    //         {
    //             delete this.photo_collection.data.max_date;
    //         }            
    //         // refresh the feed content
    //         this.populate_feed();
    //     }
    // }

})