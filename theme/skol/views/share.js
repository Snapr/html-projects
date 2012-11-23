/*global _  define require */
define(['views/share', 'config', 'backbone', 'auth', 'utils/local_storage', 'native_bridge','utils/string'],
function(original_share, config, Backbone, auth, local_storage, native_bridge, string_utils){
return original_share.extend({

    share: function(){
        $.mobile.showPageLoadingMsg();
        // if there is a secret set the picture has already been uploaded
        if (this.model && this.model.has("secret")){
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
                status: this.$("[name='skol-sharing']").is(":checked") ? "public": "public_non_app",
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
        }else{
            if (local_storage.get("appmode")){
                var params = {},
                    d = new Date(),
                    device_time =d.getFullYear() + '-' +
                        string_utils.zeroFill(d.getMonth() + 1, 2) + '-' +
                        string_utils.zeroFill(d.getDate(), 2 ) + ' ' +
                        string_utils.zeroFill(d.getHours(), 2 ) + ':' +
                        string_utils.zeroFill(d.getMinutes(), 2 ) + ':' +
                        string_utils.zeroFill(d.getSeconds(), 2 );

                _.each( this.$("form").serializeArray(), function( o ){
                    console.log(o.name, o.value);
                    if (_.contains(["tumblr", "facebook_album", "tweet", "foursquare_checkin"], o.name)){
                        if (o.name == "foursquare_checkin" && o.value == "on"){
                            if (this.model.get( "location" ).foursquare_venue_id){
                                params.foursquare_venue = this.model.get( "location" ).foursquare_venue_id;
                                params.venue_name = this.model.get( "location" ).foursquare_venue_name;
                            }
                        params[o.name] = (o.value == "on");
                        }
                    }else if(o.name == "skol-sharing"){
                        params.status = o.value == "on" ? "public" : "public_non_app";
                    }else{
                        params[o.name] = escape( o.value );
                    }

                }, this);

                params.device_time = device_time;
                params.local_id = ''+d.getMonth()+d.getDay()+d.getHours()+d.getMinutes()+d.getSeconds();

                // default to private if not set above
                if( !params.status){
                    params.status = "public_non_app";
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
        }
    },

    venue_or_geocode: function(){
        // some apps may override this
        return ( local_storage.get( "foursquare-sharing") || local_storage.get( "skol-sharing")) ? 'venue' : 'geocode';
    },

    toggle_sharing: function( e ){
        local_storage.set( e.target.id, !!$(e.target).attr("checked") );

        var venue = (this.$('#foursquare-sharing').attr("checked") || this.$('#skol-sharing').attr("checked"));

        if (e.target.id == "foursquare-sharing" || e.target.id == "skol-sharing"){
            if(this.check_geolocation()){
                this.$(".x-no-foursquare-venue").toggle(!venue);
                this.$(".x-foursquare-venue").toggle(!!venue);
                if (venue){
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
    }

});

});
