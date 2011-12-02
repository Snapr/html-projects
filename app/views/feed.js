tripmapper.views.feed = Backbone.View.extend({

    events: {
        "click button.more": "more",
        "click .list-view": "list_view",
        "click .grid-view": "grid_view"
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
        
        this.el.find('ul.gallery').empty();
        
        $.mobile.changePage( $("#feed"), {
            changeHash: false,
            transition: "slide"
        });
        
        this.photo_collection = new tripmapper.models.photo_collection();
        this.photo_collection.url = tripmapper.api_base + "/search/";
        this.photo_collection.data = query_data;
        this.photo_collection.data.n = 10;
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
        var feed_view = this;
        var options = {
            success: function()
            {
                feed_view.feed_list = feed_view.feed_list || new tripmapper.views.feed_list({
                    el: feed_view.el.find('ul.gallery').eq(0),
                    collection: feed_view.photo_collection
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
        
        this.photo_collection.fetch( options );
    },
    
    more: function()
    {
        this.populate_feed({
            max_date: this.photo_collection.last().get('date')
        });
        // console.warn('more',{max_date:this.photo_collection.last().get('date')});
    },
    
    list_view: function()
    {
        console.warn( "list_view" );
        this.feed_list.view_style = 'list';
        this.feed_list.render( this.photoswipe_init );
    },
    
    grid_view: function()
    {
        console.warn( "grid_view" );
        this.feed_list.view_style = 'grid';
        this.feed_list.render( this.photoswipe_init );
    }
})