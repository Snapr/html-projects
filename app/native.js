/*global require */
require(['utils/geo', 'utils/alerts'], function(geo, alerts){
    //export
    window.set_location = geo.set_location;
    window.location_error = geo.location_error;

    window.tapped_action = alerts.tapped_action;

    var native = {};
    native.pass_data = function( url ){
        window.location = url.replace(/\+/g, '%20');
    };

    window.upload_progress = function( data, datatype ){
        // data may be passed as an object or a string as specified via the data_type param
        // defualts to JSON object, if 'json_string' it will be a text string that needs to be parsed..
        // dont foget to convert it before you do anything with it..
        if (datatype == 'json_text'){
            data = JSON.parse(data);
        }

        if (data.uploads.length){
            if (typeof snapr.info.current_view.upload_progress == "function"){
                snapr.info.current_view.upload_progress(data);
            }
        }
    };

    window.upload_count = function( count ){
        snapr.info.upload_count = count;

        if (typeof snapr.info.current_view.upload_count == "function"){
            snapr.info.current_view.upload_count(count);
        }
    };

    window.upload_completed = function(queue_id, snapr_id){
        if (typeof snapr.info.current_view.upload_completed == "function"){
            snapr.info.current_view.upload_completed(queue_id, snapr_id);
        }
    };

    window.upload_cancelled = function( id ){
        if (typeof snapr.info.current_view.upload_cancelled == "function"){
            snapr.info.current_view.upload_cancelled( id );
        }
    };

    window.queue_settings = function(upload_mode, paused) {
        snapr.info.upload_mode = upload_mode;
        snapr.info.paused = paused;

        if(typeof snapr.info.current_view.queue_settings == "function") {
            snapr.info.current_view.queue_settings(upload_mode, paused);
        }
    };
});

