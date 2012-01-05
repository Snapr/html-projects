snapr.views.photo_edit = Backbone.View.extend({

    initialize: function()
    {
        this.el.live( "pagehide", function( e )
        {
            $(e.target).undelegate();
            
            return true;
        });
        
        // this will eventually be stored/retrieved from localstorage 
        // but for now we'll start from blank each time
        this.photo_edit_settings = {};
        
        if (this.options.query.photo_path)
        {
            this.get_photo_from_path( this.options.query.photo_path );
        }
        else if(this.options.query.photo_id)
        {
            this.get_photo_from_server( this.options.query.photo_id );
        }
        else{
            console.warn( "error, no path or photo_id" );
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
                photo_edit.el.find(".edit-image").html( $("<img src='" + photo_url + "' />") );

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
        this.model = new snapr.models.photo({
            photo_path: path
        });
        
        // temporary hack to display image
        photo_edit.el.find(".edit-image").html( $("<img src='" + path + "' />") );
        
        console.warn( "get_photo_from_path", path );
    },
    
    share: function()
    {
        if (this.model)
        {
            var redirect_url = snapr.constants.share_redirect || 
                "#/feed/?photo_id=" + this.model.get("id") + "&username=" + this.model.get("username");
                
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
                    Route.navigate( redirect_url, true );
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