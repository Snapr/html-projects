/*global _  define require */
define(['utils/local_storage', 'native_bridge', 'config'], function(local_storage, native_bridge, config){
var geo = {};
geo.location_callbacks = [];
geo.location_error_callbacks = [];
geo.cached_location = undefined;

geo.get_location = function ( success, error, no_cache ){

    if(!config.get('geolocation_enabled')){
        error('Geolocation disabled');
        geo.update_location(function(){config.set('geolocation_enabled', true);}, $.noop);
        return;
    }

    if(!no_cache && geo.cached_location && geo.cached_location.timestamp + config.get('geolocation_cache_life') > new Date()){
        if(geo.cached_location.location){
            success(geo.cached_location);
        }else{
            error('no cached location');
        }
    }else{
        geo.update_location(success, error);
    }

};

geo.update_location = function (success, error){
    // if in appmode, ask the app for location, otherwise try html5 geolocation
    if (local_storage.get( "appmode" )){
        var timeout = setTimeout(function(){
            geo.location_error('timeout');
            timeout = undefined;
        },  config.get('timeout'));

        geo.location_callbacks.push( function(location){
            clearTimeout(timeout);

            geo.cached_location = _.extend(
                {timestamp: new Date()},
                location
            );
            success(location);
        } );
        geo.location_error_callbacks.push( function(problem){
            clearTimeout(timeout);

            geo.cached_location = {timestamp: new Date()};

            config.set('geolocation_enabled', false);

            error(problem);
        } );

        native_bridge.pass_data( "snapr://get_location" );

    }else{
        if (navigator.geolocation){
            navigator.geolocation.getCurrentPosition( success, error );
        }else{
            error( "Geolocation is not supported by your browser." );
        }
    }
};

geo.set_location = function( latitude, longitude ){
    geo.location_error_callbacks = [];
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
    geo.location_callbacks = [];
    while (geo.location_error_callbacks.length){
        geo.location_error_callbacks.pop()( error );
    }
};

window.set_location = geo.set_location;
window.location_error = geo.location_error;

return geo;
});
