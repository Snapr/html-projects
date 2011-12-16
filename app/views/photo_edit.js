snapr.views.photo_edit = Backbone.View.extend({

    initialize: function( init_options )
    {
        this.el.live( "pagehide", function( e )
        {
            $(e.target).undelegate();
            
            return true;
        });
        
        // this will eventually be stored/retrieved from localstorage 
        // but for now we'll start from blank each time
        this.photo_edit_settings = {};
        
        if (init_options.query.photo_path)
        {
            this.get_photo_from_path( init_options.query.photo_path );
        }
        else
        {
            this.get_photo_from_server( init_options.query.photo );
        }
        
        $.mobile.changePage( $("#photo-edit"), {changeHash: false} );
    },
    
    events: {
        "click .share": "share"
    },
    
    get_photo_from_server: function( id )
    {
        console.warn( "get_photo_from_server", id );
        var photo_edit = this;
        this.model = new snapr.models.photo({id:id});
        this.model.fetch({
            success: function()
            {
                console.warn( "photo fetch success" );
                
                // temporary hack to display image
                var photo_url = "http://media-server2.snapr.us/lrg/" 
                    + photo_edit.model.get("secret") + "/" 
                    + photo_edit.model.get("id") + ".jpg";
                photo_edit.el.find("[data-role='content']").prepend( $("<img src='" + photo_url + "' />") );

                photo_edit.el.find("#description").val( photo_edit.model.get("description") );

            },
            error: function()
            {
                console.warn( "photo fetch error" );
            }
        });
    },
    
    get_photo_from_path: function( path )
    {
        console.warn( "get_photo_from_path", path );
    },
    
    share: function()
    {
        if (this.model)
        {
            
                // shared: {
                //     "tumblr": false,
                //     "foursquare_checkin": false,
                //     "facebook_album": false,
                //     "facebook_newsfeed": false,
                //     "tweeted":false,
                //     "facebook_shared":0
                // }
                
            this.model.save({
                description: this.el.find("#description").val(),
                status: this.el.find('#privacy-switch').val(),
                tweet: $('#twitter-sharing').attr('checked'),
                facebook_feed: $('#facebook-sharing').attr('checked'),
                tumblr: $('#tumblr-sharing').attr('checked'),
                foursquare_checkin: $('#foursquare-sharing').attr('checked'),
                
            },{
                success: function()
                {
                    console.warn( "save/share success" );
                },
                error: function()
                {
                    console.warn( "save/share error" );
                }
            });
        }
        else
        {
            console.warn( "no model for photo-edit" );
        }
    }
    

});