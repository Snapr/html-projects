/*global _  define require */
define(['views/share', 'config', 'backbone', 'auth', 'utils/local_storage', 'native_bridge','utils/string'],
function(original_share, config, Backbone, auth, local_storage, native_bridge, string_utils){
return original_share.extend({

    share_app: function(){
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
    },

    venue_or_geocode: function(){
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
