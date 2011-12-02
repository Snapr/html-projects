tripmapper.views.feed = Backbone.View.extend({

    events: {
        "click button.more": "more",
        "click .feed-view-toggle label": "feed_view_toggle"
    },

    initialize: function( init_options )
    {
        // console.warn( 'initialize feed view', init_options.query );
        var query_data = init_options.query;
        
        this.el.find('h1').text("Feed");
        
        if (query_data.username)
        {
            this.el.find('h1').text(query_data.username);
        }
        if (query_data.keywords)
        {
            this.el.find('h1').text("Search for: " + query_data.keywords);
        }
        if (query_data.area)
        {
            this.el.find('h1').text("Location Feed");
        }
        if (query_data.spot)
        {
            this.el.find('h1').text("Venue Feed");
        }
        if(query_data.favorited_by)
        {
            this.el.find('h1').text("Favorites");
        }
        if(query_data.group == 'following')
        {
            this.el.find('h1').text("Feed");
        }
        if(_.isEqual(query_data, {}))
        {
            this.el.find('h1').text("Latest Photos");
        }
        
        var feed_view = this;
        
        this.el
            .live('pagehide', function(e)
            {
                var photoSwipeInstance = Code.PhotoSwipe.getInstance( 'feed' );

                if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null)
                {
                    Code.PhotoSwipe.detatch(photoSwipeInstance);
                }
                return true; 
            });
        
        // this.el.find('ul.gallery').empty();

        this.photo_collection = new tripmapper.models.photo_collection();
        this.photo_collection.url = tripmapper.api_base + "/search/";
        this.photo_collection.data = query_data;
        this.photo_collection.data.n = 10;
        this.populate_feed();

        
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
            transition: transition,
            role: 'page'
        });
        
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

        
        var list_style = this.el.find(".feed-view-navbar .ui-btn-active").is(".grid-view") && 'grid' || 'list';
        
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

        var input_target = $('#' + e.currentTarget.htmlFor);
        var view_style = input_target.val();
        
        var container = input_target.closest( ".feed-view-toggle" );
        container.find( "input[type='radio']" ).attr( "checked", false );
        input_target.attr( "checked", true );
        container.find( "input[type='radio']" ).checkboxradio( "refresh" );
        
        this.feed_list.view_style = view_style;
        this.feed_list.render( this.photoswipe_init );

    }

})