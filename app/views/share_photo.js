/*global _ Route define require */
define(['views/base/page', 'models/photo', 'models/geo_location', 'collections/foursquare_venue',
    'views/venues', 'utils/geo', 'auth', 'utils/local_storage', 'utils/alerts', 'native'],
function(page_view, photo_model, geo_location, foursquare_venue_collection, venues_view, geo, auth, local_storage, alerts, native){
return page_view.extend({

    post_initialize: function(){
        this.template = _.template( $("#share-photo-template").html() );

        // this will eventually be stored/retrieved from localstorage
        // but for now we'll start from blank each time
        this.share_photo_settings = {};
    },

    post_activate: function(){
        this.change_page();

        this.query = this.options.query;

        if (this.query.redirect_url){
            this.redirect_url = this.query.redirect_url;
        }

        // make sure the view is empty
        this.$el.find("[data-role='content']").empty();

        // if we are coming from the venue selection screen the model will be passed in
        if (!this.model){
            if (this.query.photo_path){
                this.get_photo_from_path( this.query.photo_path + "?ts=" + new Date().getTime() );
            }else if(this.query.photo_id || this.query.photo){
                this.get_photo_from_server( this.query.photo_id || this.query.photo );
            }else{
                console.error( "no path or photo_id" );
            }
        }else{
            this.render();
        }
        this.model.bind( "change", function(){console.log('change!');} );
        window.test = this.model ;
    },

    events: {
        "change input[name='status']": "toggle_status",
        "change input[name='share_location']": "toggle_sharing",
        "change .upload-image-sharing input": "toggle_sharing",
        "vclick .upload-image-sharing .ui-disabled": "share_alert",
        "click #foursquare-venue": "venue_search",
        "click .image-controls": "toggle_photo",
        "click .x-edit-photo": "edit",
        "submit form": "share"
    },

    render: function(){
        console.log('remnder');
        var description = this.$el.find("#description").val();

        var img_url;
        if (this.model.get("secret")){
            img_url = "http://media-server2.snapr.us/lrg/" +
                this.model.get("secret") + "/" +
                this.model.get("id") + ".jpg";
        }else if (this.model.has("photo_path")){
            img_url = this.model.get("photo_path");
        }

        this.$el.find("[data-role='content']").html( this.template({
            img_url: img_url,
            screen_height: window.innerHeight,
            photo: this.model,
            status: local_storage.get( "status" ),
            share_location: local_storage.get( "share-location" ) !== 'false',
            facebook_sharing: local_storage.get( "facebook-sharing" ) && true || false,
            tumblr_sharing: local_storage.get( "tumblr-sharing" ) && true || false,
            foursquare_sharing: local_storage.get( "foursquare-sharing" ) && true || false,
            twitter_sharing: local_storage.get( "twitter-sharing" ) && true || false,
            edit: (local_storage.get( "aviary" )  == "true" || local_storage.get( "camplus_edit" )  == "true" ) && true || false
        }) ).trigger("create");


        if (description){
            this.$el.find("#description").val( description );
        }

        return this;
    },

    share_alert: function(e){
        alerts.notification( "Share", "Please set the image to Public before sharing to other services", $.noop );
    },

    get_photo_from_server: function( id )
    {
        var share_photo_view = this;

        this.model = new photo_model({
            id: id,
            location: {}
        });
        this.model.bind( "change:secret", _.bind(this.render, this) );

        this.model.bind( "set:location", _.bind(this.render, this) );
        this.model.bind( "change:foursquare_venue_name", _.bind(this.render, this) );

        this.model.fetch({
            success: function( model )
            {
                share_photo_view.$el.find("#description").val( model.get("description") );

                if (local_storage.get( "foursquare-sharing" ) &&
                    !model.get( "location" ).foursquare_venue_id &&
                    local_storage.get( "status" ) != "private")
                {
                    share_photo_view.get_foursquare_venues();
                }
                else if( !model.get( "location" ).location )
                {
                    share_photo_view.get_reverse_geocode();
                }
            },
            error: function()
            {
                console.error( "photo fetch error" );
            }
        });
    },

    get_photo_from_path: function( path )
    {

        var location = {};
        if (this.query.latitude &&
            this.query.longitude &&
            this.query.latitude !== "0.000000" &&
            this.query.longitude !== "0.000000")
        {
            location.latitude = this.query.latitude;
            location.longitude = this.query.longitude;
        }

        this.model = new photo_model({
            photo_path: path,
            location: location
        });

        this.model.bind( "change:location", this.render );
        this.model.bind( "change:foursquare_venue_name", this.render );

        this.render();

        if (local_storage.get( "foursquare-sharing") &&
            !this.model.get("location").foursquare_venue_id &&
            local_storage.get( "status" ) != "private")
        {
            this.get_foursquare_venues();
        }
        if(!local_storage.get( "foursquare-sharing" ))
        {
            this.get_reverse_geocode();
        }
    },

    get_reverse_geocode: function()
    {

        if (local_storage.get( "share-location" ) === 'false')
        {
            return;
        }

        var share_photo_view = this;

        var geocode = function( latitude, longitude )
        {
            var location = new geo_location({
                latitude: latitude,
                longitude: longitude
            });
            location.fetch({
                success: function( model )
                {
                    share_photo_view.model.set({
                        location: model.attributes
                    });
                    share_photo_view.$el.find("#no-foursquare-sharing-location").removeClass("ajax-loading");
                    share_photo_view.$el.find(".location-name").text(share_photo_view.model.get("location").location);
                }
            });
        };

        if (this.model.get("location").latitude && this.model.get("location").longitude)
        {
            // get reverse geocode location from photo lat & long
            geocode( this.model.get("location").latitude, this.model.get("location").longitude);
        }
        else
        {
            // get reverse geocode location from current position
            geo.get_location( function( location )
            {
                geocode( location.coords.latitude, location.coords.longitude );
            },
            function( e )
            {
                console.error( "geocode error", e );
            });
        }
    },

    get_foursquare_venues: function()
    {

        var share_photo_view = this;

        var get_venues = function( latitude, longitude )
        {
            share_photo_view.venue_collection = new foursquare_venue_collection({
                ll: latitude + "," + longitude
            });

            share_photo_view.venue_collection.fetch({
                success: function( collection )
                {
                    if (collection.length)
                    {
                        var location = _.extend( share_photo_view.model.attributes.location, {
                            foursquare_venue_id: collection.first().get( "id" ),
                            foursquare_venue_name: collection.first().get( "name" )
                        });
                        share_photo_view.model.set({location: location});
                        share_photo_view.$el.find("#foursquare-sharing-location").removeClass("ajax-loading");
                        share_photo_view.$el.find(".foursquare-venue-name")
                            .text(share_photo_view.model.get("location").foursquare_venue_name);
                    }
                    else
                    {
                        share_photo_view.$el.find("#foursquare-sharing-location").removeClass("ajax-loading");
                        share_photo_view.$el.find(".foursquare-venue-name").text( "No venues nearby." );
                    }
                }
            });
        };

        if (this.model.get("location").latitude && this.model.get("location").longitude)
        {
            // get venues using photo model lat and long
            get_venues( this.model.get("location").latitude, this.model.get("location").longitude);
        }
        else
        {
            // get venues based on current location (not photo)
            geo.get_location( function( location )
            {
                var photo_location = share_photo_view.model.get('location');
                photo_location.latitude = location.coords.latitude;
                photo_location.longitude = location.coords.longitude;
                share_photo_view.model.set({location: photo_location});
                get_venues( location.coords.latitude, location.coords.longitude );
            },
            function( e )
            {
                console.error( "geocode error", e );
            });
        }
    },

    toggle_status: function( e ){

        var status;
        if ($(e.currentTarget).is(":checked"))
        {
            status = "public";
        }
        else
        {
            status = "private";
        }

        local_storage.save( "status", status );

        setTimeout( this.render, 10 );

        if (status == "private" && local_storage.get( "foursquare-sharing" ))
        {
            this.get_reverse_geocode();
        }
        else if (status == "public" && local_storage.get( "foursquare-sharing" ))
        {
            this.get_foursquare_venues();
        }
    },

    toggle_sharing: function( e )
    {
        if ($(e.target).attr("checked"))
        {
            local_storage.save( e.target.id, true );
        }
        else
        {
            local_storage.save( e.target.id, false );
        }
        if (e.target.id == "foursquare-sharing")
        {
            this.$el.find("#no-foursquare-sharing-location").toggle();
            this.$el.find("#foursquare-sharing-location").toggle();
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
        var share_view = this;
        var go_to_venues = function( ll, foursquare_venue_id, back_query, model ){
            console.log('venues',ll, foursquare_venue_id, back_query, model );
            snapr.utils.dialog('venue/search/?ll='+ll+'&foursquare_venue_id=' + foursquare_venue_id, {model: model});
            // var venues = new venues_view({
            //     model: model,
            //     query: {
            //         ll: ll,
            //         foursquare_venue_id: foursquare_venue_id,
            //         back_query: back_query
            //     },
            //     el: $("#venues")[0]
            // });
            // venues.previous_view = snapr.info.current_view;
            // snapr.info.current_view = venues;
        };

        var ll;
        if (this.model.get("location").latitude && this.model.get("location").longitude ){
            ll = this.model.get("location").latitude + "," + this.model.get("location").longitude;
        }else if (this.query.latitude && this.query.longitude){
            ll = this.query.latitude + "," + this.query.longitude;
        }

        if (ll){
            go_to_venues( ll, this.model.get("location").foursquare_venue_id , this.query, this.model );
        }else{
            var share_photo_view = this;

            geo.get_location( function( location )
            {
                var ll = location.coords.latitude + "," + location.coords.longitude;

                go_to_venues( ll, false, share_photo_view.query, share_photo_view.model );
            },
            function( e )
            {
                console.error( "geocode error", e );
            });
        }
    },

    edit: function()
    {
        var appmode = local_storage.get( "appmode" );
        var camplus = local_storage.get( "camplus" );
        var camplus_edit = local_storage.get( "camplus_edit" );
        var aviary = local_storage.get( "aviary" );

        var img_url;
        if (this.model.get("secret")){
            img_url = "http://media-server2.snapr.us/lrg/" +
                this.model.get("secret") + "/" +
                this.model.get("id") + ".jpg";
        }else if (this.model.has("photo_path")){
            img_url = this.model.get("photo_path");
        }

        if (appmode && img_url){
            if (camplus && camplus_edit){
                native.pass_data( "snapr://camplus/edit/?photo_url=" + img_url );
            }else if (aviary){
                native.pass_data("snapr://aviary/edit/?photo_url=" + img_url);
            }

            setTimeout( function(){
                Route.navigate( "#/limbo/" );
            }, 600);
        }
        else
        {
            console.error("clicked on edit but not in appmode or no img_url", img_url );
        }
    },

    share: function(){
        $.mobile.showPageLoadingMsg();
        // if there is a secret set the picture has already been uploaded
        if (this.model && this.model.has("secret")){
            var redirect_url = this.redirct_url || snapr.constants.share_redirect;

            redirect_url += "photo_id=" + this.model.get("id");

            if (this.model.get("location") && this.model.get("location").latitude && this.model.get("location").longitude)
            {
                redirect_url += "&ll=" + this.model.get("location").latitude + "," + this.model.get("location").longitude;
            }

            if (this.model.get("location") && this.model.get("location").spot_id)
            {
                redirect_url += "&spot=" + this.model.get("location").spot_id;
            }

            this.model.unset( "shared", {silent: true} );
            if (_.isObject(this.model.get( "location" )))
            {
                var location = this.model.get( "location" );
                this.model.unset( "location", {silent: true} );
                var attributes = _.extend( this.model.attributes, location );
                this.model.set( attributes, {silent: true} );
            }

            this.model.set({
                description: this.$el.find("#description").val(),
                status: this.$el.find("[name='status']").is(":checked") ? "public": "private",
                share_location: ( $("#share-location").attr("checked") == "checked" ),
                facebook_album: ( $("#facebook-sharing").attr("checked") == "checked" ),
                tumblr: ( $("#tumblr-sharing").attr("checked") == "checked" ),
                foursquare_checkin: ( $("#foursquare-sharing").attr("checked") == "checked" ),
                tweet: ( $("#twitter-sharing").attr("checked") == "checked" )
            }, {silent: true});

            this.model.save({},{
                success: function( model, response )
                {
                    if(!response.success){
                        return;
                    }

                    var sharing_errors = [];
                    var sharing_successes = [];
                    if (model.get("tweet")){
                        if (response.response &&
                            response.response.twitter &&
                            response.response.twitter.error &&
                            response.response.twitter.error.code == 30 ){
                            sharing_errors.push("twitter");
                        }else{
                            sharing_successes.push("twitter");
                        }
                    }
                    if (model.get("facebook_album")){
                        if (response.response &&
                            response.response.facebook &&
                            response.response.facebook.error &&
                            response.response.facebook.error.code == 28 ){
                            sharing_errors.push("facebook");
                        }else{
                            sharing_successes.push("facebook");
                        }
                    }
                    if (model.get("foursquare_checkin")){
                        if (response.response &&
                            response.response.foursquare &&
                            response.response.foursquare.error &&
                            response.response.foursquare.error.code == 28 ){
                            sharing_errors.push("foursquare");
                        }else{
                            sharing_successes.push("foursquare");
                        }
                    }
                    if (model.get("tumblr")){
                        if (response.response &&
                            response.response.tumblr &&
                            response.response.tumblr.error &&
                            response.response.tumblr.error.code == 30 ){
                            sharing_errors.push("tumblr");
                        }else{
                            sharing_successes.push("tumblr");
                        }
                    }

                    if (sharing_errors.length){
                        var url = "#/connect/?to_link=" + sharing_errors.join(",") + "&photo_id=" + model.get("id") + "&redirect_url=" + escape(redirect_url);  //  + "&shared=" + sharing_successes.join(",")
                        Route.navigate( url );
                    }else{
                        Route.navigate( redirect_url );
                    }
                },
                error: function(){
                    console.error( "save/share error" );
                }
            });
        }else{
            if (local_storage.get("appmode")){
                var d = new Date(),
                    params = {
                        'device_time': d.getFullYear() + '-' +
                            ( d.getMonth() + 1 ).zeroFill( 2 ) + '-' +
                            d.getDate().zeroFill( 2 ) + ' ' +
                            d.getHours().zeroFill( 2 ) + ':' +
                            d.getMinutes().zeroFill( 2 ) + ':' +
                            d.getSeconds().zeroFill( 2 )
                    };
                _.each( this.$el.find("form").serializeArray(), function( o ){
                    if (["tumblr", "facebook_album", "tweet", "foursquare_checkin"].indexOf( o.name ) > -1)
                    {
                        params[o.name] = (o.value == "on");
                        if (o.name == "foursquare_checkin")
                        {
                            params.foursquare_venue = this.model.get( "location" ).foursquare_venue_id;
                            params.venue_name = this.model.get( "location" ).foursquare_venue_name;
                        }
                    }
                    else if(o.name == "status")
                    {
                        if (o.value == "off")
                        {
                            params[o.name] = "private";
                        }
                        else
                        {
                            params[o.name] = "public";
                        }
                    }
                    else
                    {
                        params[o.name] = escape( o.value );
                    }

                }, this);

                // default to public if not set above
                if( !params.status)
                {
                    params.status = "public";
                }
                _.extend(params, this.query);

                var photo = this.query && this.query.photo_path || null;
                if (photo)
                {
                    delete params.photo_path;
                    params.photo = photo;
                }

                var ll = "";
                _.extend(params, auth.attributes);

                if (params.latitude && params.longitude)
                {
                    ll = "?ll=" + params.latitude + "," + params.longitude;
                }
                else if (this.model.get( "location" ) &&
                    this.model.get( "location" ).latitude &&
                    this.model.get( "location" ).longitude )
                {
                    params.latitude = this.model.get( "location" ).latitude;
                    params.longitude = this.model.get( "location" ).longitude;
                    ll = "?ll=" + params.latitude + "," + params.longitude;
                }
                else
                {
                    ll = "";
                }

                if (params.foursquare_venue)
                {
                    ll += "&spot=" + params.foursquare_venue;
                }

                Route.navigate( "#/uploading/" + ll );
                native.pass_data("snapr://upload?" + $.param(params) );
            }
        }
    },

    toggle_photo: function( e )
    {
        this.$el.toggleClass("show-image");
    },

    upload_progress: function( upload_data )
    {
        Route.navigate( '#/uploading/' );
    }

});

});
