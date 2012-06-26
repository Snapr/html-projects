/*global _  define require */
define(['utils/local_storage', 'native'], function(local_storage, native){
var geo = {};
geo.location_callbacks = [],
geo.location_error_callbacks = [],

geo.get_location = function ( success, error ){
    // if in appmode, ask the app for location, otherwise try html5 geolocation
    if (local_storage.get( "appmode" )){
        // TODO: what is there is no response!? need timeout function.
        geo.location_callbacks.push( success );
        geo.location_error_callbacks.push( error );
        if (window.override && window.override( "snapr://get_location" )){
            //do nothing
        }else{
            if (local_storage.get( "appmode" ) == "android"){
                // android locks up the UI for like 30 seconds whenever it tries to lookup the location, so we are caching the curr location, and only getting the
                // new location is if the cached value is greater than 5 minutes old. TODO: this should really be done android-side
                var cached_location = geo.get_cached_geolocation();
                if (cached_location !== null){
                    success( cached_location );
                }else{
                    native.pass_data( "snapr://get_location" );
                }
            }else{
                native.pass_data( "snapr://get_location" );
            }
        }
    }else{
        if (navigator.geolocation){
            navigator.geolocation.getCurrentPosition( success, error );
        }else{
            error( "Geolocation is not supported by your browser." );
        }
    }
};

/* only used for android */
geo.get_cached_geolocation = function(){
    if (local_storage.supported){
        var now = new Date().getTime();
        if (local_storage.get('curr_geolocation') !== undefined &&
            now < local_storage.get('geolocation_cache_expires'))
        {
            return JSON.parse(local_storage.get('curr_geolocation'));
        }else{
            return null;
        }
    }else{
        return null;
    }
};

/* only used for android */
geo.set_cached_geolocation = function( location ){
    var geolocation_cache_time = 1000*60*5; //5 minutes in milliseconds
    if (local_storage.supported){
        var now = new Date().getTime();
        if (local_storage.get('geolocation_cache_expires') === undefined ||
            local_storage.get('geolocation_cache_expires') < now)
        {
            local_storage.set('geolocation_cache_expires', now + geolocation_cache_time);
            local_storage.set('curr_geolocation', JSON.stringify( location ));
        }
    }
};

geo.set_location = function( latitude, longitude ){
    while (geo.location_callbacks.length){
        geo.location_callbacks.pop()({
            coords: {
                latitude: latitude,
                longitude: longitude
            }
        });
    }
};
geo.location_error = function( error ){
    while (geo.location_error_callbacks.length){
        geo.location_error_callbacks.pop()( error );
    }
};

window.set_location = geo.set_location;
window.location_error = geo.location_error;

return geo;
});
