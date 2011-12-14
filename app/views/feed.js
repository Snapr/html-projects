tripmapper.views.feed = Backbone.View.extend({

    events: {
        "click button.more": "more",
        "change .feed-view-toggle": "feed_view_toggle"
    },

    initialize: function( init_options )
    {
        // console.warn( 'initialize feed view', init_options.query );
        var query_data = init_options.query;

        var list_style = query_data.list_style || 'list';

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


        if (query_data.username)
        {
            var feed_header = new tripmapper.views.user_header({
                username: query_data.username,
                el: this.el.find(".feed-header").empty()
            });
        }
        else
        {
            var feed_header = new tripmapper.views.feed_header({
                query_data: query_data,
                el: this.el.find(".feed-header").empty()
            });
        }
        
        this.pending_uploads = {};

        var feed_view = this;

        feed_view.el.find(".feed-upload-list").empty();
        feed_view.el.find('ul.gallery').empty();
        
        this.el.live( 'pageshow', function()
        {
            toggle_container.find( "input[type='radio']" ).checkboxradio( "refresh" );

        });

        this.el.live('pagehide', function( e )
        {
            var photoSwipeInstance = Code.PhotoSwipe.getInstance( 'feed' );

            if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null)
            {
                Code.PhotoSwipe.detatch(photoSwipeInstance);
            }
            
            return true; 
        });

        // if we are coming from the map view do a flip, otherwise do a slide transition
        if ($.mobile.activePage.attr('id') == 'map' )
        {
            var transition = "flip";
        }
        else
        {
            var transition = "slide";
        }
        
        $.mobile.changePage( $("#feed"), {
            changeHash: false,
            transition: transition
        });
        
        this.photo_collection = new tripmapper.models.photo_collection();
        this.photo_collection.url = tripmapper.api_base + "/search/";
        this.photo_collection.data = query_data;
        this.photo_collection.data.n = tripmapper.constants.feed_count;
        this.populate_feed();
        
    },
    
    photoswipe_init: function()
    {
        // detach the previous photoswipe instance if it exists
        var photoSwipeInstance = Code.PhotoSwipe.getInstance( 'feed' );

        if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null)
        {
            Code.PhotoSwipe.detatch(photoSwipeInstance);
        }

        if ($( "ul.gallery a.gallery_link", this.el ).length)
        {
            // make sure we set the param backButtonHideEnabled:false to prevent photoswipe from changing the hash
            var photoSwipeInstance = $( "ul.gallery a.gallery_link", this.el )
                .photoSwipe( {
                    backButtonHideEnabled: false
                }, 'feed' );
        }
        

        $.mobile.hidePageLoadingMsg();
    },
    
    populate_feed: function( additional_data )
    {
        
        var list_style = this.el.find("#feed-view-grid").is(":checked") && 'grid' || 'list';
        
        console.warn('populate feed list style', list_style);
        
        if (this.feed_list)
        {
            this.feed_list.list_style = list_style;
        }

        var feed_view = this;
        var options = {
            success: function()
            {
                if (!feed_view.feed_list)
                {
                    feed_view.feed_list = new tripmapper.views.feed_list({
                        el: feed_view.el.find('ul.gallery').eq(0),
                        collection: feed_view.photo_collection,
                        list_style: list_style
                    });
                }

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
        
        this.photo_collection.fetch( options );
    },
    
    more: function()
    {
        this.populate_feed({
            max_date: this.photo_collection.last().get('date')
        });
        // console.warn('more',{max_date:this.photo_collection.last().get('date')});
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
            feed_view.pending_uploads[photo.id] = new tripmapper.views.upload_progress_li({
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
        if (this.options.query.username == tripmapper.auth.get("username")
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