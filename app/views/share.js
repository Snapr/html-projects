/*global _  define require T */
define(['config', 'backbone', 'views/base/page', 'models/photo', 'models/comp', 'models/geo_location', 'collections/foursquare_venue',
    'utils/geo', 'auth', 'utils/local_storage', 'utils/alerts', 'native_bridge', 'utils/dialog', 'utils/string'],
function(config, Backbone, page_view, photo_model, comp_model, geo_location, foursquare_venue_collection, geo,
    auth, local_storage, alerts, native_bridge, dialog, string_utils){
return page_view.extend({

    post_activate: function(options){
        this.$('.x-s-image-placeholder').attr('src', '');
        this.change_page();
        this.$('.x-description').val();

        if(this.options.query.comp_id){
            this.comp = new comp_model({id: this.options.query.comp_id});
            this.comp.fetch();
        }

        this.query = options.query;
        if(this.query.latitude === "0.000000"){ delete this.query.latitude; }
        if(this.query.longitude === "0.000000"){ delete this.query.longitude; }


        if (this.query.redirect_url){
            this.redirect_url = this.query.redirect_url;
        }

        // make sure the view is empty
        this.$(".x-content").empty();

        if (this.query.photo_path){
            this.get_photo_from_path( this.query.photo_path + "?ts=" + new Date().getTime() );
        }else if(this.query.photo_id || this.query.photo){
            this.get_photo_from_server( this.query.photo_id || this.query.photo );
        }else{
            console.error( "no path or photo_id" );
        }
    },

    events: {
        "change .x-status": "toggle_status",
        "change .x-share-location": "toggle_sharing",
        "change .x-image-sharing input": "toggle_sharing",
        "vclick .x-image-sharing .ui-disabled": "share_alert",
        "click .x-foursquare-venue": "venue_search",
        "click .x-image-toggle": "toggle_photo",
        "click .x-edit-photo": "edit",
        "click .x-camplus-edit-photo": "edit_camplus",
        "submit form": "share",
        "keypress .x-description": 'log_key',
        "blur .x-description": 'log',
        "focus .x-description": 'log',
        "click .x-description": 'log'
    },

    log: function(e){console.log(e.type,this.$('.x-description').val() );},
    log_key: function(e){console.log(e.type, e.keyCode, this.$('.x-description').val());},

    render: function(callback){
        var img_url;
        if (this.model.get("secret")){
            img_url = "http://media-server2.snapr.us/lrg/" +
                this.model.get("secret") + "/" +
                this.model.get("id") + ".jpg";
        }else if (this.model.has("photo_path")){
            img_url = this.model.get("photo_path");
        }

        var description = this.$('.x-description').val() || this.query.description || this.model.get("description") || '',
            location = this.query.location || this.model.get("location").location || '';

        this.replace_from_template({
            img_url: img_url,
            screen_height: window.innerHeight,
            photo: this.model,
            status: local_storage.get( "status" ),
            share_location: local_storage.get( "share-location" ) !== false,
            facebook_sharing: local_storage.get( "facebook-sharing" ),
            tumblr_sharing: local_storage.get( "tumblr-sharing" ),
            foursquare_sharing: local_storage.get( "foursquare-sharing" ) && config.get('geolocation_enabled'),
            twitter_sharing: local_storage.get( "twitter-sharing" ),
            edit: (local_storage.get( "aviary" ) || local_storage.get( "camplus_edit" )),
            camplus: local_storage.get( "camplus" ),
            saved_description: unescape(description),
            saved_location: unescape(location),
            comp: this.comp,
            local_storage: local_storage
        }, ['.x-content']).trigger("create");

        if(_.isFunction(callback)){
            callback();
        }

        return this;
    },

    share_alert: function(e){
        alerts.notification( T("Share"), T("Please set the image to Public before sharing to other services"), $.noop );
    },

    check_geolocation: function(){
        if(config.get('geolocation_enabled')){
            return true;
        }else{
            alerts.notification( T("Location"), T("Please enable location services for this app to use these features"), $.noop );
            return false;
        }
    },

    get_photo_from_server: function( id ){
        var share_photo_view = this;

        this.model = new photo_model({
            id: id,
            location: {}
        });

        this.model.fetch({
            success: function( model ){

                var location = {};
                if (share_photo_view.query.latitude &&
                    share_photo_view.query.longitude){
                    location.latitude = share_photo_view.query.latitude;
                    location.longitude = share_photo_view.query.longitude;
                }
                if (share_photo_view.query.foursquare_venue_id && share_photo_view.query.foursquare_venue_name){
                    location.foursquare_venue_id = share_photo_view.query.foursquare_venue_id;
                    location.foursquare_venue_name = unescape(share_photo_view.query.foursquare_venue_name);
                }
                if(location && location.latitude){
                    model.set('location', location);
                }

                if (share_photo_view.venue_or_geocode() == 'venue' &&
                    !model.get( "location" ).foursquare_venue_id &&
                    local_storage.get( "status" ) != "private"){
                    share_photo_view.get_foursquare_venues();
                }
                if( share_photo_view.venue_or_geocode() == 'grocode' && !share_photo_view.query.location ){
                    share_photo_view.get_reverse_geocode();
                }

                share_photo_view.render();
            },
            error: function(){
                console.error( "photo fetch error" );
            }
        });
    },

    get_photo_from_path: function( path ){

        var location = {};
        if (this.query.latitude &&
            this.query.longitude){
            location.latitude = this.query.latitude;
            location.longitude = this.query.longitude;
        }
        if (this.query.foursquare_venue_id && this.query.foursquare_venue_name){
            location.foursquare_venue_id = this.query.foursquare_venue_id;
            location.foursquare_venue_name = unescape(this.query.foursquare_venue_name);
        }

        this.model = new photo_model({
            photo_path: path,
            location: location
        });

        this.model.bind( "change", this.render );

        this.render();

        if (this.venue_or_geocode() == 'venue' &&
            !this.model.get("location").foursquare_venue_id &&
            local_storage.get( "status" ) != "private"){
            this.get_foursquare_venues();
        }
        if(this.venue_or_geocode() == 'geocode' && !this.query.location ){
            this.get_reverse_geocode();
        }
    },

    venue_or_geocode: function(){
        // some apps may override this
        return local_storage.get( "foursquare-sharing") ? 'venue' : 'geocode';
    },

    get_reverse_geocode: function(){

        if (local_storage.get( "share-location" ) === false){
            return;
        }

        var share_photo_view = this;

        var geocode = function( latitude, longitude ){
            var location = new geo_location({
                latitude: latitude,
                longitude: longitude
            });
            location.fetch({
                success: function( model ){
                    share_photo_view.model.set({
                        location: model.attributes
                    }, {silent:true});
                    share_photo_view.$(".x-location-name").text(share_photo_view.model.get("location").location);
                },
                complete: function(){
                    share_photo_view.$(".x-no-foursquare-venue").removeClass("x-ajax-loading");
                }
            });
        };

        if (this.model.get("location").latitude && this.model.get("location").longitude){
            // get reverse geocode location from photo lat & long
            geocode( this.model.get("location").latitude, this.model.get("location").longitude);
        }else{
            // get reverse geocode location from current position
            geo.get_location(
                function( location ){
                    geocode( location.coords.latitude, location.coords.longitude );
                },
                function( e ){
                    share_photo_view.$(".x-location-name").text('location disabled');
                    share_photo_view.$('.x-share-location').attr('checked', false).checkboxradio("refresh");
                    share_photo_view.$(".x-no-foursquare-venue").removeClass("x-ajax-loading");
                    console.error( "get reverse geocode", e );
                }
            );
        }
    },

    get_foursquare_venues: function(){

        var share_photo_view = this;

        var get_venues = function( latitude, longitude ){
            share_photo_view.venue_collection = new foursquare_venue_collection({
                ll: latitude + "," + longitude
            });

            share_photo_view.venue_collection.fetch({
                success: function( collection ){
                    if (collection.length){
                        var location = _.extend( share_photo_view.model.attributes.location, {
                            foursquare_venue_id: collection.first().get( "id" ),
                            foursquare_venue_name: collection.first().get( "name" )
                        });
                        share_photo_view.model.set({location: location}, {silent:true});
                        share_photo_view.$(".x-foursquare-venue-name")
                            .text(share_photo_view.model.get("location").foursquare_venue_name);
                    }else{
                        share_photo_view.$(".x-foursquare-venue-name").text( T("No venues nearby.") );
                    }
                },
                complete: function(){
                    share_photo_view.$(".x-foursquare-venue").removeClass("x-ajax-loading");
                }
            });
        };

        if (this.model.get("location").latitude && this.model.get("location").longitude){
            // get venues using photo model lat and long
            get_venues( this.model.get("location").latitude, this.model.get("location").longitude);
        }else{
            // get venues based on current location (not photo)
            geo.get_location( function( location ){
                var photo_location = share_photo_view.model.get('location');
                photo_location.latitude = location.coords.latitude;
                photo_location.longitude = location.coords.longitude;
                share_photo_view.model.set({location: photo_location});
                get_venues( location.coords.latitude, location.coords.longitude );
            },
            function( e ){
                share_photo_view.$(".x-foursquare-venue-name").text('location disabled');
                share_photo_view.$('.x-share-location').attr('checked', false).checkboxradio("refresh");
                share_photo_view.$(".x-no-foursquare-venue").removeClass("x-ajax-loading");
                console.error( "get foursquare venue geocode error", e );
            });
        }
    },

    toggle_status: function( e ){

        var status;
        if ($(e.currentTarget).is(":checked")){
            status = "public";
        }else{
            status = "private";
        }

        local_storage.set( "status", status );

        var share_view = this;

        // I don't know what this timeout is for, maybe local storage takes a while to actually set.
        setTimeout( function(){
            share_view.render(function(){
                if (this.venue_or_geocode() == 'geocode'){
                    share_view.get_reverse_geocode();
                }else if (status == "public" && this.venue_or_geocode() == 'venue'){
                    share_view.get_foursquare_venues();
                }else{
                    share_view.$(".x-no-foursquare-venue, .x-foursquare-venue").removeClass("x-ajax-loading");
                }
            });
        }, 10 );
    },

    toggle_sharing: function( e ){
        local_storage.set( e.target.id, !!$(e.target).attr("checked") );

        if (e.target.id == "foursquare-sharing"){
            if(this.check_geolocation()){
                this.$(".x-no-foursquare-venue").toggle();
                this.$(".x-foursquare-venue").toggle();
                if ($(e.target).attr("checked")){
                    this.get_foursquare_venues();
                }else{
                    this.get_reverse_geocode();
                }
            }else{
                $(e.target).attr("checked", false);
            }
        }
        if (e.target.id == "share-location" && $(e.target).attr("checked")){
            if(this.check_geolocation()){
                this.get_reverse_geocode();
            }else{
                $(e.target).attr("checked", false);
            }
        }
    },

    venue_search: function(){
        var share_view = this;
        var go_to_venues = function( ll, foursquare_venue_id, back_query, model ){
            dialog('foursquare_venues/?ll='+ll+'&foursquare_venue_id=' + foursquare_venue_id, {model: model});
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

            geo.get_location( function( location ){
                var ll = location.coords.latitude + "," + location.coords.longitude;

                go_to_venues( ll, false, share_photo_view.query, share_photo_view.model );
            },
            function( e ){
                console.error( "venue search geocode error", e );
            });
        }
    },

    edit: function(){
        $.mobile.showPageLoadingMsg();

        var appmode = local_storage.get( "appmode" );
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
            native_bridge.pass_data("snapr://aviary/edit/?photo_url=" + img_url + "&" + this.get_photo_edit_params());

            setTimeout( function(){
                Backbone.history.navigate( "#/limbo/" );
            }, 600);
        }else{
            console.error("clicked on edit but not in appmode or no img_url", img_url );
        }
    },

    edit_camplus: function(){
        this.query.description = escape(this.$(".x-description").val());
        window.navigator.hash = "#/share/?" + $.param( this.query );

        var appmode = local_storage.get( "appmode" );
        var camplus = local_storage.get( "camplus" );

        var img_url;
        if (this.model.get("secret")){
            img_url = "http://media-server2.snapr.us/lrg/" +
                this.model.get("secret") + "/" +
                this.model.get("id") + ".jpg";
        }else if (this.model.has("photo_path")){
            img_url = this.model.get("photo_path");
        }

        if (appmode && img_url){
            if (camplus){
                native_bridge.pass_data( "snapr://camplus/edit/?photo_url=" + img_url + "&" + this.get_photo_edit_params());
            }
        }else{
            console.error("clicked on camplus edit but not in appmode or no img_url", img_url );
        }
    },

    get_photo_edit_params: function(){
        var params = {};
        params.description = escape(this.$(".x-description").val());
        var location = this.model.get("location") || {};
        if (location.foursquare_venue_name && location.foursquare_venue_id){
            params.foursquare_venue_name = escape(location.foursquare_venue_name);
            params.foursquare_venue_id = location.foursquare_venue_id;
        }else if (location.location){
            params.location = escape(location.location);
        }
        return $.param( params );

    },
    share: function(){
        $.mobile.showPageLoadingMsg();
        // if there is a secret set the picture has already been uploaded
            console.log(this.model && this.model.has("secret"));
        if (this.model && this.model.has("secret")){
           this.share_browser();
        }else{
            this.share_app();
        }
    },
    share_browser: function(){
        console.log('web');
        var redirect_url = this.redirct_url || config.get('share_redirect');

        if(this.options.query.comp_id){
            redirect_url += "comp_id=" + this.options.query.comp_id + "&";
        }

        redirect_url += "photo_id=" + this.model.get("id");

        if (this.model.get("location") && this.model.get("location").latitude && this.model.get("location").longitude){
            redirect_url += "&ll=" + this.model.get("location").latitude + "," + this.model.get("location").longitude;
        }

        if (this.model.get("location") && this.model.get("location").spot_id){
            redirect_url += "&spot=" + this.model.get("location").spot_id;
        }

        this.model.unset( "shared", {silent: true} );
        if (_.isObject(this.model.get( "location" ))){
            var location = this.model.get( "location" );
            this.model.unset( "location", {silent: true} );
            var attributes = _.extend( this.model.attributes, location );
            this.model.set( attributes, {silent: true} );
        }

        this.model.set({
            description: this.$(".x-description").val(),
            status: this.$("[name='status']").is(":checked") ? "public": "private",
            share_location: ( $("#share-location").attr("checked") == "checked" ),
            facebook_album: ( $("#facebook-sharing").attr("checked") == "checked" ),
            tumblr: ( $("#tumblr-sharing").attr("checked") == "checked" ),
            foursquare_checkin: ( $("#foursquare-sharing").attr("checked") == "checked" ),
            tweet: ( $("#twitter-sharing").attr("checked") == "checked" )
        }, {silent: true});

        if(this.options.query.comp_id){
            this.model.set({
                comp_id: this.options.query.comp_id
            }, {silent: true});
        }

        this.model.save({},{
            success: function( model, response ){
                if(!response.success){
                    return;
                }

                var sharing_errors = [];
                var sharing_successes = [];
                if (model.get("tweet")){
                    if (response.response &&
                        response.response.twitter &&
                        response.response.twitter.error &&
                        response.response.twitter.error.type == "linked_service.twitter.no_account" ){
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
                        response.response.foursquare.error.type == "linked_service.foursquare.no_account" ){
                        sharing_errors.push("foursquare");
                    }else{
                        sharing_successes.push("foursquare");
                    }
                }
                if (model.get("tumblr")){
                    if (response.response &&
                        response.response.tumblr &&
                        response.response.tumblr.error &&
                        response.response.tumblr.error.type == "linked_service.tumblr.no_account" ){
                        sharing_errors.push("tumblr");
                    }else{
                        sharing_successes.push("tumblr");
                    }
                }

                if (sharing_errors.length){
                    var url = "#/connect/?to_link=" + sharing_errors.join(",") + "&photo_id=" + model.get("id") + "&redirect_url=" + escape(redirect_url);  //  + "&shared=" + sharing_successes.join(",")
                    Backbone.history.navigate( url );
                }else{
                    Backbone.history.navigate( redirect_url );
                }
            },
            error: function(){
                console.error( "save/share error" );
            }
        });
    },

    share_app: function(){
        if (local_storage.get("appmode")){
            var params = {};

            _.each( this.$("form").serializeArray(), function( o ){
                if (_.contains(["tumblr", "facebook_album", "tweet", "foursquare_checkin"], o.name)){
                    if (o.name == "foursquare_checkin" && o.value == "on"){
                        if (this.model.get( "location" ).foursquare_venue_id){
                            params.foursquare_venue = this.model.get( "location" ).foursquare_venue_id;
                            params.venue_name = this.model.get( "location" ).foursquare_venue_name;
                        }
                    }
                    params[o.name] = (o.value == "on");
                }else if(o.name == "status" && o.value == "on"){
                    params.status = "public";
                }else if(o.name == "app-sharing"){
                    params.status = o.value == "on" ? "public" : "public_non_app";
                }else{
                    params[o.name] = escape( o.value );
                }

            }, this);

            var d = new Date();
            params.device_time = string_utils.date_to_snapr_format(d);
            params.local_id = ''+d.getMonth()+d.getDay()+d.getHours()+d.getMinutes()+d.getSeconds();

            // default to private if not set above
            if( !params.status){
                params.status = config.get('app_sharing') ? 'public_non_app' : "private";
            }

            if(config.get('app_group')){
                params.app_group = config.get('app_group');
            }

            if(this.options.query.comp_id){
                params.comp_id = this.options.query.comp_id;
            }

            // if share_location is not checked serializeArray will not include it
            params.share_location = $("#share-location").attr("checked") == "checked";
            _.extend(params, this.query);

            var photo = this.query && this.query.photo_path || null;
            if (photo){
                delete params.photo_path;
                params.photo = photo;
            }

            var extras = "";
            _.extend(params, auth.attributes);

            if (params.latitude && params.longitude){
                extras = "?ll=" + params.latitude + "," + params.longitude;
            }else if (this.model.get( "location" ) &&
                this.model.get( "location" ).latitude &&
                this.model.get( "location" ).longitude ){
                params.latitude = this.model.get( "location" ).latitude;
                params.longitude = this.model.get( "location" ).longitude;
                extras = "?ll=" + params.latitude + "," + params.longitude;
            }else{
                extras = "";
            }

            if (params.foursquare_venue){
                extras += "&spot=" + params.foursquare_venue;
            }
            if (params.venue_name){
                extras += "&venue_name=" + params.venue_name;
            }
            if (params.comp_id){
                extras += "&comp_id=" + params.comp_id;
            }
            extras += "&local_id=" + params.local_id;


            Backbone.history.navigate( "#/uploading/" + extras );
            native_bridge.pass_data("snapr://upload?" + $.param(params) );
        }
    },

    toggle_photo: function( e ){
        this.$el.toggleClass("x-show-image");
    },

    offline: function(offline_mode){
        if(offline_mode){
            this.$(".x-location-name").text('Offline');
            this.$(".x-foursquare-venue-name").text('Offline');
        }
    },

    dialog_closed: function(){
        this.render();
    }

});

});
