snapr.views.photo_edit = Backbone.View.extend({

    initialize: function()
    {
        this.el.live( "pagehide", function( e )
        {
            $(e.target).undelegate();
            
            return true;
        });
        
        this.template = _.template( $("#photo-edit-template").html() );
        this.img_template = _.template( $("#photo-edit-image-template").html() );
        // this will eventually be stored/retrieved from localstorage 
        // but for now we'll start from blank each time
        this.photo_edit_settings = {};
        
        this.query = this.options.query;
        
        if (this.query.redirect_url)
        {
            this.redirect_url = this.query.redirect_url;
        }
        if (this.query.photo_path)
        {
            this.get_photo_from_path( this.query.photo_path );
        }
        else if(this.query.photo_id || this.query.photo)
        {
            this.get_photo_from_server( this.query.photo_id || this.query.photo );
        }
        else{
            console.warn( "error, no path or photo_id" );
        }
        $.mobile.changePage( $("#photo-edit"), {changeHash: false} );
        this.render();
    },
    
    events: {
        "change select": "toggle_sharing",
        "submit form": "share",
        "click .skip": "skip_to_love_it"
    },
    
    render: function()
    {
        $(this.el).find("[data-role='content']").html( this.template() ).trigger("create");
        
        return this;
    },
    
    get_photo_from_server: function( id )
    {
        console.warn( "get_photo_from_server", id );
        var photo_edit = this;
        this.model = new snapr.models.photo({id: id});
        this.model.fetch({
            success: function()
            {
                console.warn( "photo fetch success" );
                
                // temporary hack to display image
                var img_url = "http://media-server2.snapr.us/sml/" 
                    + photo_edit.model.get("secret") + "/" 
                    + photo_edit.model.get("id") + ".jpg";

                $(photo_edit.el).find(".edit-image").html( photo_edit.img_template({img_url: img_url}) );
                $(photo_edit.el).find("#description").val( photo_edit.model.get("description") );

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
        
        if (this.query.latitude)
        {
            this.model.set({latitude: this.query.latitude});
        }
        if (this.query.longitude)
        {
            this.model.set({longitude: this.query.longitude});
        }
        
        // temporary hack to display image
        $(this.el).find(".edit-image").html( this.img_template({img_url: path}) );
        
        console.warn( "get_photo_from_path", path );
    },
    
    toggle_sharing: function( e )
    {
        if (e.target.value == "on")
        {
            $(this.el).find("input[type='submit']").button("enable");
            $(this.el).find(".share-message").hide();
            $(this.el).find("textarea").show();
        }
        else
        {
            if ($("select option[value='on']:selected").length == 0)
            {
                $(this.el).find("input[type='submit']").button("disable");
                $(this.el).find(".share-message").show();
                $(this.el).find("textarea").hide();
            }
        }
    },
    
    share: function()
    {
        // if there is an id set the picture has already been uploaded
        if (this.model && this.model.has("id"))
        {
            var redirect_url = this.redirct_url || snapr.constants.share_redirect || 
                // "#/uploading/?photo_id=" + this.model.get("id");
                "#/love-it/?shared=true&photo_id=" + this.model.get("id");
                
            this.model.save({
                description: this.el.find("#description").val(),
                public_group: ( $("#enter-girl-of-month").val() == "on" ) && snapr.public_group || false,
                // status: this.el.find('#privacy-switch').val(),
                facebook_feed: ( $("#facebook-sharing").val() == "on" ),
                tumblr: ( $("#tumblr-sharing").val() == "on" ),
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
            if (snapr.utils.get_local_param("appmode"))
            {
                var params = {};
                _.each( $(this.el).find("form").serializeArray(), function( o ){
                    params[o.name] = o.value;
                });
                _.extend(params, this.query);
                _.extend(params, snapr.auth.attributes);

                pass_data("snapr://upload?" + $.param(params).replace(/\+/g, '%20') );
            }
        }
    },
    
    skip_to_love_it: function()
    {
        if (this.model.has("photo_path"))
        {
            var query_string = "#/love-it/?photo_path=" + this.model.get("photo_path");
        }
        else
        {
            var query_string = "#/love-it/?photo_id=" + this.model.get("id")
        }
        
        Route.navigate( query_string, true );
    }
    

});