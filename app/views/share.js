/*global _  define require T */
define(['config', 'backbone', 'views/base/page', 'models/photo', 'models/comp', 'models/geo_location', 'collections/foursquare_venue',
    'utils/geo', 'auth', 'utils/local_storage', 'utils/analytics', 'utils/alerts', 'native_bridge', 'utils/dialog', 'utils/string', 'utils/web_upload'],
function(config, Backbone, page_view, photo_model, comp_model, geo_location, foursquare_venue_collection, geo,
    auth, local_storage, analytics, alerts, native_bridge, dialog, string_utils, xhr_upload){
return page_view.extend({

    post_activate: function(options){

        // clear out old details
        //this.$('.x-image').attr('src', '');
        //this.$('.x-description').val();
        this.$(".x-content").empty();

        this.change_page();

        this.query = options.query;

        if(this.query.comp_id){
            this.comp = new comp_model({id: this.query.comp_id});
            this.comp.fetch();
        }

        this.location = {};
        if (this.query.foursquare_venue_id && this.query.foursquare_venue_name){
            this.location.foursquare_venue_id = this.query.foursquare_venue_id;
            this.location.foursquare_venue_name = unescape(this.query.foursquare_venue_name);
        }
        if (!!Number(this.query.latitude) && !!Number(this.query.longitude)){
            this.location.latitude = this.query.latitude;
            this.location.longitude = this.query.longitude;
        }

        if (this.query.photo_path){
            this.method = 'app';
            this.get_photo_from_path( this.query.photo_path + "?ts=" + new Date().getTime() );
        }else if(this.query.photo_id || this.query.photo){
            this.method = 'edit';
            this.get_photo_from_server( this.query.photo_id || this.query.photo );
        }else{
            this.method = 'web';
            this.get_photo_from_input();
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
        "submit form": "share"
    },

    render: function(callback){
        if (this.venue_or_geocode() == 'venue' &&
            !this.model.get("location").foursquare_venue_id &&
            local_storage.get( "status" ) != "private"){
            this.get_foursquare_venues();
        }
        if(this.venue_or_geocode() == 'geocode' && !this.query.location ){
            this.get_reverse_geocode();
        }

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


        this.toggle_sharing_message();

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
        var this_view = this;

        this.model = new photo_model({
            id: id,
            location: {}
        });

        this.model.fetch({
            success: function( model ){

                if(this_view.location.latitude){
                    model.set('location', location);
                }

                this_view.render();
            },
            error: function(){
                console.error( "photo fetch error" );
            }
        });
    },

    get_photo_from_path: function( path ){

        this.model = new photo_model({
            photo_path: path,
            location: this.location
        });

        this.model.bind( "change", this.render );

        this.render();
    },

    get_photo_from_input: function(){
        var this_view = this;

        this.model = new photo_model({
            location: this.location
        });

        this.model.bind( "change", this.render );

        this.render();

        var files = $('#x-web-upload').get(0).files;
        if(!files.length){
            console.error( "file input empty" );
            return;
        }
        var file = files[0];
        var thumb_reader = new FileReader();
        thumb_reader.onloadend = function(e) {
            var img = $('<img class="x-image"/>');
            img.attr('src', e.target.result);
            img.appendTo($('.x-image-placeholder'));
            this_view.image_data_url = e.target.result;
        };
        thumb_reader.readAsDataURL(file);
    },

    venue_or_geocode: function(){
        // some apps may override this
        return local_storage.get( "foursquare-sharing") ? 'venue' : 'geocode';
    },

    get_reverse_geocode: function(){

        if (local_storage.get( "share-location" ) === false){
            return;
        }

        var this_view = this;

        var geocode = function( latitude, longitude ){
            var location = new geo_location({
                latitude: latitude,
                longitude: longitude
            });
            location.fetch({
                success: function( model ){
                    this_view.model.set({
                        location: model.attributes
                    }, {silent:true});
                    this_view.$(".x-location-name").text(this_view.model.get("location").location);
                },
                complete: function(){
                    this_view.$(".x-no-foursquare-venue").removeClass("x-ajax-loading");
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
                    this_view.$(".x-location-name").text('location disabled');
                    this_view.$('.x-share-location').attr('checked', false).checkboxradio("refresh");
                    this_view.$(".x-no-foursquare-venue").removeClass("x-ajax-loading");
                    console.error( "get reverse geocode", e );
                }
            );
        }
    },

    get_foursquare_venues: function(){

        var this_view = this;

        var get_venues = function( latitude, longitude ){
            this_view.venue_collection = new foursquare_venue_collection({
                ll: latitude + "," + longitude
            });

            this_view.venue_collection.fetch({
                success: function( collection ){
                    if (collection.length){
                        var location = _.extend( this_view.model.attributes.location, {
                            foursquare_venue_id: collection.first().get( "id" ),
                            foursquare_venue_name: collection.first().get( "name" )
                        });
                        this_view.model.set({location: location}, {silent:true});
                        this_view.$(".x-foursquare-venue-name")
                            .text(this_view.model.get("location").foursquare_venue_name);
                    }else{
                        this_view.$(".x-foursquare-venue-name").text( T("No venues nearby.") );
                    }
                },
                complete: function(){
                    this_view.$(".x-foursquare-venue").removeClass("x-ajax-loading");
                }
            });
        };

        if (this.model.get("location").latitude && this.model.get("location").longitude){
            // get venues using photo model lat and long
            get_venues( this.model.get("location").latitude, this.model.get("location").longitude);
        }else{
            // get venues based on current location (not photo)
            geo.get_location( function( location ){
                var photo_location = this_view.model.get('location');
                photo_location.latitude = location.coords.latitude;
                photo_location.longitude = location.coords.longitude;
                this_view.model.set({location: photo_location});
                get_venues( location.coords.latitude, location.coords.longitude );
            },
            function( e ){
                this_view.$(".x-foursquare-venue-name").text('location disabled');
                this_view.$('.x-share-location').attr('checked', false).checkboxradio("refresh");
                this_view.$(".x-no-foursquare-venue").removeClass("x-ajax-loading");
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

        this.toggle_sharing_message();

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

    toggle_sharing_message: function(){
     
        var sharing = this.is_sharing();
        this.$('.x-sharing-message, .x-done-button').toggle(!sharing);
        this.$('.x-description, .x-share-button').toggle(sharing);
        this.$('.x-done-button').parent().toggle(!sharing);
        this.$('.x-share-button').parent().toggle(sharing);
    },

    is_sharing: function(){
        var this_view = this;
        if(this.get_status() != 'private'){
            return true;
        }
        return _.any(
            ['facebook', 'foursquare', 'twitter', 'tumblr', 'app'],
            function(service){
                return this_view.$('#' + service + '-sharing').attr("checked");
            }
        );
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
            var this_view = this;

            geo.get_location( function( location ){
                var ll = location.coords.latitude + "," + location.coords.longitude;

                go_to_venues( ll, false, this_view.query, this_view.model );
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

    update_model: function(){
        this.model.unset( "shared", {silent: true} );
        if (_.isObject(this.model.get( "location" ))){
            var location = this.model.get( "location" );
            this.model.unset( "location", {silent: true} );
            var attributes = _.extend( this.model.attributes, location );
            this.model.set( attributes, {silent: true} );
        }

        this.model.set({
            description: this.$(".x-description").val(),
            status: this.get_status(),
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
    },

    share: function(){
        if(!this.is_sharing()){
            window.location.hash = this.back_url || '#';
            return;
        }
        $.mobile.showPageLoadingMsg();
        switch(this.method){
            case 'app':
                this.share_app();
                break;
            case 'edit':
                this.share_basic();
                break;
            case 'web':
                this.share_xhr();
                break;
        }
    },
    share_basic: function(){
        this.update_model();

        var redirect_url = config.get('share_redirect') + $.param(this.get_upload_params());

        analytics.trigger('share', this.model.attributes);
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

    get_upload_params: function(){
        var params = _.pick(this.model.attributes, 'description', 'status', 'share_location', "tumblr", "facebook_album", "tweet", "foursquare_checkin");

        if (this.model.has('location') && this.model.get('location').foursquare_venue_id){
            params.foursquare_venue = this.model.get('location').foursquare_venue_id;
            params.venue_name = this.model.get('location').foursquare_venue_name;
        }

        var d = new Date();
        params.device_time = string_utils.date_to_snapr_format(d);
        params.local_id = ''+d.getMonth()+d.getDay()+d.getHours()+d.getMinutes()+d.getSeconds();

        if(config.get('app_group')){
            params.app_group = config.get('app_group');
        }

        _.extend(params, this.query);

        if (this.query && this.query.photo_path){
            delete params.photo_path;
            params.photo = this.query && this.query.photo_path;
        }

        _.extend(params, auth.attributes);

        if (!(params.latitude && params.longitude) && this.model.has('location')){
            params.latitude = this.model.get( "location" ).latitude;
            params.longitude = this.model.get( "location" ).longitude;
        }

        return params;
    },

    share_app: function(){
        this.update_model();
        var upload_params = this.get_upload_params();

        analytics.trigger('share', upload_params);
        window.location.hash = config.get('share_redirect') + $.param(upload_params);
        native_bridge.pass_data('snapr://upload?' + $.param(upload_params));
    },

    share_xhr: function(){
        this.update_model();
        var upload_params = this.get_upload_params();
        upload_params.thumbnail = this.image_data_url;

        analytics.trigger('share', upload_params);
        window.location.hash = config.get('share_redirect') + $.param(upload_params);
        xhr_upload(upload_params);
    },

    get_status: function(){
        if(this.$('#image-status').attr('checked')){
            if(!config.get('app_sharing_opt_in') || this.$('#app-sharing').attr('checked')){
                return 'public';
            }
            return 'public_non_app';
        }
        return 'private';
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
