snapr.views.share_photo = Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );

        this.el.live( "pagehide", function( e )
        {
            $(e.target).undelegate();

            return true;
        });

        this.template = _.template( $("#share-photo-template").html() );
        this.img_template = _.template( $("#share-photo-image-template").html() );
        // this will eventually be stored/retrieved from localstorage
        // but for now we'll start from blank each time
        this.share_photo_settings = {};

        this.query = this.options.query;

        if (this.query.redirect_url)
        {
            this.redirect_url = this.query.redirect_url;
        }

        $.mobile.changePage( $("#share-photo"), {changeHash: false} );

        if (this.query.photo_path)
        {
            this.get_photo_from_path( this.query.photo_path + "?ts=" + new Date().getTime() );
        }
        else if(this.query.photo_id || this.query.photo)
        {
            this.get_photo_from_server( this.query.photo_id || this.query.photo );
        }
        else{
            console.log( "error, no path or photo_id" );
        }
    },

    events: {
        "change input[name='status']": "toggle_status",
        "change input[name='share_location']": "toggle_sharing",
        "change .upload-image-sharing input": "toggle_sharing",
        "click #foursquare-venue": "venue_search",
        "submit form": "share"
    },

    render: function()
    {
        $(this.el).find("[data-role='content']").html( this.template({
            photo: this.model,
            status: snapr.utils.get_local_param( "status" ),
            share_location: snapr.utils.get_local_param( "share-location" ) && true || false,
            facebook_sharing: snapr.utils.get_local_param( "facebook-sharing" ) && true || false,
            tumblr_sharing: snapr.utils.get_local_param( "tumblr-sharing" ) && true || false,
            foursquare_sharing: snapr.utils.get_local_param( "foursquare-sharing" ) && true || false,
            twitter_sharing: snapr.utils.get_local_param( "twitter-sharing" ) && true || false
        }) ).trigger("create");

        return this;
    },

    get_photo_from_server: function( id )
    {
        var share_photo = this;
        this.model = new snapr.models.photo({id: id});
        this.model.bind( "change:secret", this.render );
        this.model.bind( "change:location", this.render );
        this.model.fetch({
            success: function()
            {
                console.log( "photo fetch success" );

                // temporary hack to display image
                var img_url = "http://media-server2.snapr.us/sml/"
                    + share_photo.model.get("secret") + "/"
                    + share_photo.model.get("id") + ".jpg";

                $(share_photo.el).find(".image-placeholder").html( share_photo.img_template({img_url: img_url}) );
                $(share_photo.el).find("#description").val( share_photo.model.get("description") );

            },
            error: function()
            {
                console.log( "photo fetch error" );
            }
        });
    },

    get_photo_from_path: function( path )
    {
        this.model = new snapr.models.photo({
            photo_path: path,
            location: {}
        });
        this.render();

        if (snapr.utils.get_local_param( "foursquare-sharing" ))
        {
            this.get_foursquare_venues();
        }
        else
        {
            this.get_reverse_geocode();
        }
        $(this.el).find(".image-placeholder").html( this.img_template({img_url: path}) );
    },

    get_reverse_geocode: function()
    {

        if (!snapr.utils.get_local_param( "share-location" ))
        {
            return;
        }

        var photo = this;

        var geocode = function( latitude, longitude )
        {
            var location = new snapr.models.geo_location({
                latitude: latitude,
                longitude: longitude
            });
            location.fetch({
                success: function( model )
                {
                    photo.model.set({
                        location: model.attributes
                    });
                    $(photo.el).find("#no-foursquare-sharing-location").removeClass("ajax-loading");
                    $(photo.el).find(".location-name").text(photo.model.get("location").location);
                }
            });
        }

        if (this.query.latitude && this.query.longitude && !this.model.get("location").location)
        {
            geocode( this.query.latitude, this.query.longitude)
        }
        else
        {
            snapr.geo.get_location( function( location )
            {
                geocode( location.coords.latitude, location.coords.longitude );
            },
            function( e )
            {
                console.log( "geocode error", e );
            });
        }
    },

    get_foursquare_venues: function()
    {

        var photo = this;

        var get_venues = function( latitude, longitude )
        {
            photo.collection = new snapr.models.foursquare_venue_collection({
                ll: latitude + "," + longitude
            });

            photo.collection.fetch({
                success: function( collection )
                {
                    var location = _.extend( photo.model.attributes.location, {
                        foursquare_venue_id: collection.first().get( "id" ),
                        foursquare_venue_name: collection.first().get( "name" )
                    });
                    photo.model.set({location: location});
                    $(photo.el).find("#foursquare-sharing-location").removeClass("ajax-loading");
                    $(photo.el).find(".foursquare-venue-name").text(photo.model.get("location").foursquare_venue_name);
                }
            });
        }


        if (this.query.latitude && this.query.longitude && !this.model.attributes.location.foursquare_venue_id)
        {
            get_venues( this.query.latitude, this.query.longitude)
        }
        else
        {
            snapr.geo.get_location( function( location )
            {
                photo.model.set({location: location.coords});
                get_venues( location.coords.latitude, location.coords.longitude );
            },
            function( e )
            {
                console.log( "geocode error", e );
            });
        }
    },

    toggle_status: function( e )
    {
        snapr.utils.save_local_param( "status", e.target.value );
    },

    toggle_sharing: function( e )
    {
        if ($(e.target).attr("checked"))
        {
            snapr.utils.save_local_param( e.target.id, true );
        }
        else
        {
            snapr.utils.delete_local_param( e.target.id );
        }
        if (e.target.id == "foursquare-sharing")
        {
            $(this.el).find("#no-foursquare-sharing-location").toggle();
            $(this.el).find("#foursquare-sharing-location").toggle();
            if ($(e.target).attr("checked"))
            {
                this.get_foursquare_venues();
            }
            else
            {
                this.get_reverse_geocode();
            }
        }
        if (e.target.id == "share-location" && $(e.target).attr("checked"))
        {
            this.get_reverse_geocode();
        }
    },

    venue_search: function()
    {
        console.log("venue search", this.model)

        Route.navigate( "#/venue/search/?ll=" +
            this.model.get("location").latitude + "," +
            this.model.get("location").longitude + "&foursquare_venue_id=" +
            this.model.get("location").foursquare_venue_id, true);
    },

    share: function()
    {
        var pink_nation_sharing = ( $("#enter-girl-of-month").val() == "on" );

        // if there is a secret set the picture has already been uploaded
        if (this.model && this.model.has("secret"))
        {
            var redirect_url = this.redirct_url || snapr.constants.share_redirect ||
                // "#/uploading/?photo_id=" + this.model.get("id");
                "#/feed/?photo_id=" + this.model.get("id") + "&username=" + this.model.get("username");

            this.model.save({
                description: this.el.find("#description").val(),
                status: this.el.find("[name='status']:checked").val(),
                share_location: ( $("#share-location").attr("checked") == "checked" ),
                faceboook_album: ( $("#facebook-sharing").attr("checked") == "checked" ),
                tumblr: ( $("#tumblr-sharing").attr("checked") == "checked" ),
                foursquare_checkin: ( $("#foursquare-sharing").attr("checked") == "checked" ),
                tweet: ( $("#twitter-sharing").attr("checked") == "checked" )
            },{
                success: function( model, xhr )
                {
                    // console.log( model, xhr );
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
                    var sharing_successes = [];
                    if (model.get("facebook_gallery"))
                    {
                        if (xhr.response &&
                            xhr.response.facebook &&
                            xhr.response.facebook.error &&
                            xhr.response.facebook.error.code == 28 )
                        {
                            sharing_errors.push("facebook");
                        }
                        else
                        {
                            sharing_successes.push("facebook");
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
                        else
                        {
                            sharing_successes.push("tumblr");
                        }

                    }
                    if (sharing_errors.length)
                    {
                        var url = "#/connect/?to_link=" + sharing_errors.join(",") + "&shared=" + sharing_successes.join(",") + "&photo_id=" + model.get("id");
                        Route.navigate( url, true );
                    }
                    else
                    {
                        Route.navigate( redirect_url, true );
                    }
                },
                error: function()
                {
                    console.log( "save/share error" );
                }
            });
        }
        else
        {
            if (snapr.utils.get_local_param("appmode"))
            {
                var params = {};
                _.each( $(this.el).find("form").serializeArray(), function( o ){
                    if (["tumblr", "facebook_gallery"].indexOf( o.name ) > -1)
                    {
                        params[o.name] = (o.value == "on");
                    }
                    else if (o.name == "enter-girl-of-month")
                    {
                        // do nothing
                    }
                    else
                    {
                        params[o.name] = o.value;
                    }

                });
                _.extend(params, this.query);

                var photo = this.query && this.query.photo_path || null;
                if (photo)
                {
                    delete params.photo_path;
                    params["photo"] = photo;
                }

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

    upload_progress: function( upload_data )
    {
        Route.navigate( '#/uploading/', true );
    },

    upload_completed: function( queue_id, snapr_id )
    {
        Route.navigate( "#/love-it/?shared=true&photo_id=" + snapr_id, true );
    }

});
