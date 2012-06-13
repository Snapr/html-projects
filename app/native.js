require(['utils/geo', 'utils/alerts'], function(geo, alerts){
    //export
    window.set_location = geo.set_location;
    window.location_error = geo.location_error;

    window.tapped_action = alerts.tapped_action;

    var native = {};
    native.pass_data = function( url ){
        window.location = url.replace(/\+/g, '%20');
    };
});

