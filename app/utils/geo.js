/*global _ Route define require */
define(['utils/local_storage'], function(local_storage){
var geo = {};
geo.location_callbacks = [],
geo.location_error_callbacks = [],

geo.get_location = function ( success, error ){
    // if in appmode, ask the app for location, otherwise try html5 geolocation
    if (local_storage.get( "appmode" )){
        // TODO: what is there is no response!? need timeout function.
        geo.location_callbacks.push( success );
        geo.location_callbacks.push( error );
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
                    pass_data( "snapr://get_location" );
                }
            }else{
                pass_data( "snapr://get_location" );
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
geo.get_cached_geolocation = function()
{
    if (snapr.info.supports_local_storage)
    {
        var now = new Date().getTime();
        if (localStorage.getItem('curr_geolocation') !== undefined &&
            now < localStorage.getItem('geolocation_cache_expires'))
        {
            return JSON.parse(localStorage.getItem('curr_geolocation'));
        }
        else
        {
            return null;
        }
    }
    else
    {
        return null;
    }
};

/* only used for android */
geo.set_cached_geolocation = function( location )
{
    var geolocation_cache_time = 1000*60*5; //5 minutes in milliseconds
    if (snapr.info.supports_local_storage)
    {
        var now = new Date().getTime();
        if (localStorage.getItem('geolocation_cache_expires') === undefined ||
            localStorage.getItem('geolocation_cache_expires') < now)
        {
            localStorage.setItem('geolocation_cache_expires', now + geolocation_cache_time);
            localStorage.setItem('curr_geolocation', JSON.stringify( location ));
        }
    }
};

geo.set_location = function( latitude, longitude )
{
    while (geo.location_callbacks.length)
    {
        geo.location_callbacks.pop()({
            coords: {
                latitude: latitude,
                longitude: longitude
            }
        });
    }
};
geo.location_error = function( error )
{
    while (geo.location_error_callbacks.length)
    {
        geo.location_error_callbacks.pop()( error );
    }
};

return geo;
});
