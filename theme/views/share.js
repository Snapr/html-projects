/*global _, define, require, T */
define(['config', 'backbone', 'views/base/view', 'views/base/share_page', 'models/photo', 'models/comp', 'models/geo_location', 'collections/foursquare_venue',
    'utils/geo', 'auth', 'utils/local_storage', 'utils/analytics', 'utils/alerts', 'utils/query', 'native_bridge', 'utils/dialog', 'utils/string', 'utils/web_upload'],
function(config, Backbone, base_view, share_page_view, photo_model, comp_model, geo_location, foursquare_venue_collection, geo,
    auth, local_storage, analytics, alerts, Query, native_bridge, dialog, string_utils, xhr_upload){

var share_view = share_page_view.extend({

    post_initialize: function(){
        console.log("share view initialized");
        var settings = local_storage.get('share_settings', 'none');
        if(settings == 'none'){
            local_storage.set('share_settings', {location: config.get('share_location_default')});
        }
    },

    post_activate: function(options){

        if(!auth.has('access_token')){
            var query = new Query(this.options.query);
            query.set('redirect', escape(window.location.href));
            this.output_data = this.previous_view.output_data;  // grab fx output data if present
            window.location.href = '#/share-preview/?' + query.toString();
            return;
        }

        // clear out old details
        this.$(".x-content").empty();

        this.change_page();

        this.query = options.query;

        if(this.query.comp_id){
            this.comp = new comp_model({id: this.query.comp_id});
            this.comp.deferred = $.Deferred();
            var comp = this.comp;
            this.comp.fetch({success:function(){comp.deferred.resolve();}});
        }else{
            this.comp = null;
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

        this.get_photo();
    },

    events: {
        'click .x-photo': 'show_lightbox',
        'click .x-lightbox': 'hide_lightbox',
        'change .x-status': 'toggle_status',
        'click .x-location': 'toggle_location_sharing',
        'change .x-photo-sharing input': 'toggle_sharing',
        'change .x-photo-sharing select': 'toggle_sharing',
        'vclick .x-photo-sharing .ui-disabled': 'share_alert',
        'click .x-photo-toggle': 'toggle_photo',
        'submit form': 'share',
        'change .x-description': 'update_description'
    },

    render: function(callback){  var self = this;

        var img_url;
        if (this.model.get("secret")){
            img_url = "http://media-server2.snapr.us/lrg/" +
                this.model.get("secret") + "/" +
                this.model.get("id") + ".jpg";
        }else if (this.model.has("photo_path")){
            img_url = this.model.get("photo_path");
        }
        local_storage.set('last_share_image', img_url);

        var replace_content = function(){
            var sharing = local_storage.get('share_settings', {});
            if(sharing.app === undefined){ sharing.app = config.get('app_sharing_opt_in_default'); }
            self.replace_from_template({
                img_url: img_url,
                photo: self.model,
                app_sharing: sharing.app,
                facebook_sharing: sharing.facebook,
                tumblr_sharing: sharing.tumblr,
                foursquare_sharing: sharing.foursquare && config.get('geolocation_enabled'),
                twitter_sharing: sharing.twitter,
                appdotnet_sharing: sharing.appdotnet,
                comp: self.comp
            }, ['.x-content']).trigger("create");

            self.toggle_sharing_message();

            self.update_location();

            if(_.isFunction(callback)){
                callback();
            }
        };
        if(this.comp){
            this.comp.deferred.done(replace_content);
        }else{
            replace_content();
        }

        return this;
    },

    update_description: function(){
        this.model.set({ description: this.$(".x-description").val() }, {silent: true});
    },

    update_location: function(location){
        location = {
            text: location || this.query.location
        };
        if(this.venue_or_geocode() == 'venue'){
            location.type = 'venue';
        }else if(local_storage.get('share_settings', {}).location){
            location.type = 'geocode';
        }else{
            location.type = 'disabled';
        }
        if(location.type == 'venue'){
            location.text = location.text || this.model.get('location').foursquare_venue_name;
        }else{
            location.text = location.text || this.model.get("location").location;
        }

        // if it's not disabled at there is no text we must have to get it dynamically
        if(location.type != 'disabled' && !location.text && local_storage.get("share_settings", {}).status != "private"){
            if(location.type == 'venue'){
                this.get_foursquare_venues();
            }else{
                this.get_reverse_geocode();
            }
            location.type = 'loading';
        }

        this.replace_from_template({location: location}, ['.x-location']).trigger("create");

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

    venue_or_geocode: function(){
        if(config.get('app_photos_must_have_venue')){
            var app_sharing = local_storage.get('share_settings', {}).app;
            if(app_sharing === undefined){ app_sharing = config.get('app_sharing_opt_in_default'); }
            if(config.get('app_sharing_opt_in') && !(app_sharing || this.is_sharing())){
                return 'geocode';
            }
            return 'venue';
        }
        // some apps may override this
        return local_storage.get('share_settings', {}).foursquare ? 'venue' : 'geocode';
    },

    get_reverse_geocode: function(){  var self = this;

        if (!local_storage.get('share_settings', {}).location){
            return;
        }

        var geocode = function( latitude, longitude ){
            var location = new geo_location({
                latitude: latitude,
                longitude: longitude
            });
            location.fetch({
                success: function( model ){
                    self.model.set({
                        location: model.attributes
                    }, {silent:true});
                    self.update_location();
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
                    var share_settings = local_storage.get('share_settings', {});
                    share_settings.location = false;
                    local_storage.set('share_settings', share_settings);
                    self.update_location();
                    alerts.notification('Error', 'Please enable location settings');
                    console.error( "get reverse geocode", e );
                }
            );
        }
    },

    get_foursquare_venues: function(){

        var this_view = this;

        var get_venues = function( latitude, longitude ){
            this_view.venue_collection = new foursquare_venue_collection({
                ll: latitude + "," + longitude,
                limit: 6
            });

            this_view.venue_collection.fetch({
                success: function( collection ){
                    if (collection.length){
                        var location = _.extend( this_view.model.attributes.location, {
                            foursquare_venue_id: collection.first().get( "id" ),
                            foursquare_venue_name: collection.first().get( "name" )
                        });
                        this_view.model.set({location: location}, {silent:true});
                        this_view.update_location();
                    }else{
                        this_view.update_location(T("No venues nearby."));
                    }
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
                this.$('#foursquare-sharing').prop('checked', false).checkboxradio('refresh');
                var share_settings = local_storage.get('share_settings', {});
                share_settings.foursquare = false;
                local_storage.set('share_settings', share_settings);
                this_view.update_location();
                alerts.notification('Error', 'Please enable location settings');
                console.error( "get foursquare venue geocode error", e );
            });
        }
    },

    toggle_status: function( e ){  var self = this;

        var status;
        if (this.is_on($(e.currentTarget))){
            status = "public";
        }else{
            status = "private";
        }

        var share_settings = local_storage.get('share_settings', {});
        share_settings.status = status;
        local_storage.set('share_settings' , share_settings);

        // I don't know what this timeout is for, maybe local storage takes a while to actually set.
        setTimeout( function(){
            self.get_photo(function(){
                if (self.venue_or_geocode() == 'geocode'){
                    self.get_reverse_geocode();
                }else{
                    self.get_foursquare_venues();
                }
            });
        }, 10 );
    },

    toggle_sharing: function( e ){
        var on =  this.is_on($(e.target));

        var share_settings = local_storage.get('share_settings', {});

        // if we just tuend on 4sq, get venue
        if(on && e.target.id == 'foursquare-sharing'){
            share_settings.location = true;
        }

        share_settings[e.target.id.substring(0,e.target.id.length-8)] = on;
        local_storage.set('share_settings' , share_settings);

        this.toggle_sharing_message();

        if(!this.check_geolocation()){
            this.is_on($(e.target), false);
        }

        this.update_location();
    },

    toggle_location_sharing: function(e){

        // if clicking location when in 4sq mode - look up venues instead of toggling
        if(this.venue_or_geocode() == 'venue'){
            this.venue_search();
            return;
        }

        var share_settings = local_storage.get('share_settings', {});
        share_settings.location = share_settings.location === false;
        local_storage.set('share_settings' , share_settings);

        this.toggle_sharing_message();

        // if we have not location, turn it off again
        if(!this.check_geolocation()){
            this.is_on($(e.target), false);
        }

        this.update_location();
    },

    toggle_sharing_message: function(){
        var sharing = this.is_sharing();
        this.$('.x-sharing-message').toggle(!sharing);
        this.$('.x-description').toggle(sharing);
        this.$('.x-done-button').toggle(!sharing);
        this.$('.x-share-button').toggle(sharing);

        // support old style markup too for now
        // previously these classes were on the button elements, not wrappers
        // jQm wraps them to allow styling, we need to target that wrapper
        this.$('.x-done-button').parent('.ui-btn').toggle(!sharing);
        if(this.$('.x-share-button').parent('.ui-btn').toggle(sharing).length){
            console.warn('Create a wrapper for x-done-botton and x-share-button and move the x-classes to the wrapper.');
        }
    },

    is_sharing: function(){
        if(!config.get('app_sharing_opt_in') || this.get_status() == 'public'){
            return true;
        }
        var this_view = this;
        return _.any(
            ['facebook', 'foursquare', 'twitter', 'tumblr', 'app'],
            function(service){
                return this_view.is_on(this_view.$('#' + service + '-sharing'));
            }
        );
    },

    venue_search: function(){  var self = this;

        // function that actually does the work
        var show_venues_panel = function( ll, current_venue ){
            var panel = $( ".x-venues-panel" );
            panel.panel( "toggle" );


            if(self.venue_list){
                self.venue_list.set_options({
                    ll: ll,
                    current_venue: current_venue,
                    photo: self.model
                });
                self.venue_list.collection.fetch();
            }else{
                self.venue_list = new venue_list({
                    el: panel,
                    template: self.template,
                    ll: ll,
                    current_venue: current_venue,
                    photo: self.model
                });
            }

        };


        // get location, then call above function

        var ll;
        if (this.model.get("location").latitude && this.model.get("location").longitude ){
            ll = this.model.get("location").latitude + "," + this.model.get("location").longitude;
        }else if (this.query.latitude && this.query.longitude){
            ll = this.query.latitude + "," + this.query.longitude;
        }

        if (ll){
            show_venues_panel( ll, self.model.get("location").foursquare_venue_id );
        }else{
            geo.get_location( function( location ){
                var ll = location.coords.latitude + "," + location.coords.longitude;

                show_venues_panel( ll, false );
            },
            function( e ){
                console.error( "venue search geocode error", e );
            });
        }
    },

    update_model: function(){
        this.model.unset( "shared", {silent: true} );

        var this_view = this;

        this.model.set({
            description: this.$(".x-description").val(),
            status: this.get_status(),
            share_location: ( this_view.is_on(this_view.$("#share-location")) ),
            facebook_album: ( this_view.is_on(this_view.$("#facebook-sharing")) ),
            tumblr: ( this_view.is_on(this_view.$("#tumblr-sharing")) ),
            foursquare_checkin: ( this_view.is_on(this_view.$("#foursquare-sharing")) ),
            tweet: ( this_view.is_on(this_view.$("#twitter-sharing")) )
        }, {silent: true});

        this.model.unset('display_username', {silent: true});

        if(this.options.query.comp_id && (!this_view.$("#comp-sharing").length || this_view.is_on(this_view.$("#comp-sharing")))){
            this.model.set({
                comp_id: this.options.query.comp_id
            }, {silent: true});
        }
    },

    is_on: function(element, set){
        if(set === undefined){
            // GET

            if(!element.length){ return false; }
            if(element[0].checked !== undefined){
                return element[0].checked;
            }else{
                return $(element).val() == 'true';
            }
        }else{
            // SET

            if(!element.length){ return element; }
            if(element[0].checked !== undefined){
                element[0].checked = false;
            }else{
                return $(element).val(set);
            }
            return element;
        }
    },

    share: function(){
        if(!this.is_sharing()){
            analytics.trigger('skip_sharing');
            window.location.hash = this.back_url || '#';
            return;
        }

        $.mobile.loading('show');
        switch(this.photo_source){
            case 'path':
                this.share_app();
                break;
            case 'server':
                this.share_basic();
                break;
            case 'input':
                this.share_xhr();
                break;
            case 'fx':
                this.share_fx();
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
        var params = _.pick(this.model.attributes, 'description', 'status', "tumblr", "facebook_album", "tweet", "foursquare_checkin");

        params.share_location = local_storage.get('share_settings', {}).location;

        if(params.share_location){
            if (params.share_location && this.model.has('location') && this.model.get('location').foursquare_venue_id){
                params.foursquare_venue = this.model.get('location').foursquare_venue_id;
                params.venue_name = this.model.get('location').foursquare_venue_name;
            }else if(params.share_location && this.model.has('foursquare_venue_id')){
                params.foursquare_venue = this.model.get('foursquare_venue_id');
                params.venue_name = this.model.get('foursquare_venue_name');
            }

            if (this.model.has('location') && _.isString(this.model.get('location'))){
                params.location = this.model.get('location');
            }
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

        _.extend(params, _.pick(auth.attributes, 'access_token', 'app_group'));

        if(params.share_location){
            if (!(params.latitude && params.longitude) && this.model.has('location')){
                params.latitude = this.model.get( "location" ).latitude;
                params.longitude = this.model.get( "location" ).longitude;
            }
            if (!params.location && this.model.has('location')){
                params.location = this.model.get( "location" ).location;
            }
        }else{
            delete params.location;
            delete params.latitude;
            delete params.longitude;
        }

        if(params.location && (params.location == 'undefined' || params.location === undefined)){
            delete params.location;
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
        upload_params.thumbnail = this.image_data;

        analytics.trigger('share', upload_params);
        xhr_upload(upload_params);

        var url_params = _.extend({}, upload_params);
        delete url_params.thumbnail;
        window.location.hash = config.get('share_redirect') + $.param(url_params);
    },

    share_fx: function(){
        this.update_model();
        var upload_params = this.get_upload_params();
        upload_params.thumbnail = this.output_data;

        analytics.trigger('share', upload_params);
        xhr_upload(upload_params, 'fx');

        var url_params = _.extend({}, upload_params);
        delete url_params.thumbnail;
        window.location.hash = config.get('share_redirect') + $.param(url_params);
    },

    get_status: function(){
        var sharing = local_storage.get('share_settings', {});
        if(sharing.app === undefined){ sharing.app = config.get('app_sharing_opt_in_default'); }

        if(sharing.status != 'private'){

            if(!config.get('app_sharing_opt_in') || sharing.app){
                return 'public';
            }
            return 'public_non_app';
        }
        return 'private';
    },

    toggle_photo: function( e ){
        this.$el.toggleClass("x-show-image");
    },

    dialog_closed: function(){
        this.get_photo();
    }

});

    var venue_list = base_view.extend({
        initialize: function(options){  var self = this;
            self.template = options.template;

            this.$el.addClass('x-loading');

            if(!options.retry){
                this.$('.x-search-input').val('');
            }

            this.collection = new foursquare_venue_collection({
                ll: options.ll,
                limit: 6
            });

            this.set_options(options);

            this.collection.on('sync', _.bind(this.render, this));
            this.collection.fetch();
        },

        set_options: function(options){
            this.$(".x-venue-list").empty();
            this.photo = options.photo;
            this.current_venue = options.current_venue;
            this.query = options.query;
            this.collection.data.ll = options.ll;
        },

        render: function(){  var self = this;

            self.$el.trigger( "updatelayout" );

            self.replace_from_template({
                current_venue: self.current_venue,
                venues: self.collection
            }, ['.x-venue-list']).listview().listview("refresh");

            self.$el.trigger( "updatelayout" );

            this.$el.removeClass('x-loading');

        },

        events: {
            "submit .x-venue-search": "search",
            'click .x-venue': 'select_venue'
        },

        search: function(e){  var self = this;
            if(e){
                e.preventDefault();
            }

            var input = this.$('.x-venue-search input').blur();
            var keywords = input.val().toLowerCase();

            if (keywords.length > 0){
                self.$el.addClass('x-loading');
                self.collection.data.query = keywords;
                self.collection.fetch({complete:function(){
                    self.$el.removeClass('x-loading');
                }});
            }else{
                if (this.collection.data.query){
                    delete this.collection.data.query;
                }
                this.collection.fetch();
            }
            return false;

        },

        select_venue: function(e){
            var button = $(e.currentTarget);
            var venue = {
                foursquare_venue_id: button.data("id"),
                foursquare_venue_name: button.data("name")
            };

            var location = _.extend({}, this.photo.get( "location" ), venue );

            this.photo.set({
                'location': location
            });

            this.$el.panel('close');
        }
    });


    return share_view;

});
