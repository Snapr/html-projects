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
        $.mobile.changePage( $("#photo-edit"), {changeHash: false} );
        this.render();
        if (this.query.photo_path)
        {
            this.get_photo_from_path( this.query.photo_path + "?ts=" + new Date().getTime() );
        }
        else if(this.query.photo_id || this.query.photo)
        {
            this.get_photo_from_server( this.query.photo_id || this.query.photo );
        }
        else{
            console.warn( "error, no path or photo_id" );
        }
    },
    
    events: {
        "change select": "toggle_sharing",
        "submit form": "share",
        "click .skip": "skip_to_love_it"
    },
    
    render: function()
    {
        $(this.el).find("[data-role='content']").html( this.template() ).trigger("create");
        
        if (snapr.utils.get_local_param( "facebook-sharing" ) == "on")
        {
            $(this.el).find("#facebook-sharing").val("on").slider("refresh").trigger("change");
        }

        if (snapr.utils.get_local_param( "tumblr-sharing" ) == "on")
        {
            $(this.el).find("#tumblr-sharing").val("on").slider("refresh").trigger("change");
        }

        if (snapr.utils.get_local_param( "enter-girl-of-month" ) == "on")
        {
            $(this.el).find("#enter-girl-of-month").val("on").slider("refresh").trigger("change");
        }
        
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
        
        $(this.el).find(".edit-image").html( this.img_template({img_url: path}) );
    },
    
    toggle_sharing: function( e )
    {
        if (e.target.value == "on")
        {
            $(this.el).find("input[type='submit']").button("enable");
            $(this.el).find(".share-message").hide();
            $(this.el).find("textarea").show();
            snapr.utils.save_local_param( e.target.id, "on" );
        }
        else
        {
            snapr.utils.save_local_param( e.target.id, "off" );
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
        var pink_nation_sharing = ( $("#enter-girl-of-month").val() == "on" );
        
        // if there is a secret set the picture has already been uploaded
        if (this.model && this.model.has("secret"))
        {
            var redirect_url = this.redirct_url || snapr.constants.share_redirect || 
                // "#/uploading/?photo_id=" + this.model.get("id");
                "#/love-it/?shared=true&photo_id=" + this.model.get("id");

            this.model.save({
                description: this.el.find("#description").val(),
                // public_group: ( $("#enter-girl-of-month").val() == "on" ) && snapr.public_group || false,
                status: "public",
                facebook_feed: ( $("#facebook-sharing").val() == "on" ),
                tumblr: ( $("#tumblr-sharing").val() == "on" ),
            },{
                success: function( model, xhr )
                {
                    // console.warn( model, xhr );
                    if (pink_nation_sharing && !snapr.utils.get_local_param("appmode"))
                    {
                        $.ajax({
                            url: snapr.api_base + "/public_groups/pool/add/",
                            dataType: "jsonp",
                            data: {
                                photo_id: model.get("id"),
                                group_slug: snapr.public_group,
                                app_group: snapr.app_group,
                                access_token: snapr.auth.get("access_token"),
                                _method: "POST"
                            },
                            success: function(response)
                            {
                                if (response.error)
                                {
                                    alert( response.error.message );
                                }
                            }
                        });
                    }
                    
                    var sharing_errors = [];
                    if (model.get("facebook_feed"))
                    {
                        if (xhr.response && 
                            xhr.response.facebook && 
                            xhr.response.facebook.error && 
                            xhr.response.facebook.error.code == 28 )
                        {
                            sharing_errors.push("facebook");
                        }
                    }
                    if (model.get("tumblr"))
                    {
                        if (xhr.response && 
                            xhr.response.tumblr && 
                            xhr.response.tumblr.error && 
                            xhr.response.tumblr.error.code == 30 )
                        {
                            sharing_errors.push("tumblr");
                        }
                    }
                    if (sharing_errors.length)
                    {
                        var url = "#/linked-services/?to_link=" + sharing_errors.join(",") + "&photo_id=" + model.get("id");
                        Route.navigate( url, true );
                    }
                    else
                    {
                        Route.navigate( redirect_url, true );
                    }
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

                if (pink_nation_sharing)
                {
                    _.extend(params, {
                        public_group: snapr.public_group,
                        app_group: snapr.app_group
                    });
                }
                // temporary
                Route.navigate("#/uploading/", true );
                pass_data("snapr://upload?" + $.param(params) );
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
    },
    
    upload_progress: function( upload_data )
    {
        Route.navigate( '#/uploading/', true );
    },
    
    upload_completed: function( queue_id, snapr_id )
    {
        Route.navigate( "#/love-it/?shared=true&photo_id=" + snapr_id, true );
    }

});