/*global _  define require */
define(['views/share', 'config', 'backbone', 'auth', 'utils/local_storage', 'native_bridge','utils/string'],
function(original_share, config, Backbone, auth, local_storage, native_bridge, string_utils){
return original_share.extend({

    venue_or_geocode: function(){
        return ( local_storage.get( "foursquare-sharing") || local_storage.get( "app-sharing")) ? 'venue' : 'geocode';
    },

    render: function(){
        original_share.prototype.render.apply(this, arguments);
        if(this.$('#app-sharing').attr('checked')){
            this.$(".x-no-foursquare-venue").hide();
            this.$(".x-foursquare-venue").show();
        }
    },

    toggle_sharing: function( e ){
        local_storage.set( e.target.id, !!$(e.target).attr("checked") );

        this.toggle_sharing_message();

        var venue = (this.$('#foursquare-sharing').attr("checked") || this.$('#app-sharing').attr("checked"));

        if (e.target.id == "foursquare-sharing" || e.target.id == "app-sharing"){
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
