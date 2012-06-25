/*global define */
define(['config'], function(config){
    //export

    // we can't to this here because geo relises on pass_data - circ.dep.
    // window.set_location = geo.set_location;
    // window.location_error = geo.location_error;

    // we can't to this here because alerts relises on pass_data - circ.dep.
    // window.tapped_action = alerts.tapped_action;

    var native = {};
    native.pass_data = function( url ){
        var iframe = document.createElement("IFRAME");
        iframe.setAttribute("src", url);
        document.documentElement.appendChild(iframe);
        iframe.parentNode.removeChild(iframe);
        iframe = null;
    };

    window.upload_progress = function( data, datatype ){
        // data may be passed as an object or a string as specified via the data_type param
        // defualts to JSON object, if 'json_string' it will be a text string that needs to be parsed..
        // dont foget to convert it before you do anything with it..
        if (datatype == 'json_text'){
            data = JSON.parse(data);
        }

        if (data.uploads.length){
            if (typeof config.get('current_view').upload_progress == "function"){
                config.get('current_view').upload_progress(data);
            }
        }
    };

    window.upload_count = function( count ){
        config.set('upload_count', count);

        if (typeof config.get('current_view').upload_count == "function"){
            config.get('current_view').upload_count(count);
        }
    };

    window.upload_completed = function(queue_id, snapr_id){
        if (typeof config.get('current_view').upload_completed == "function"){
            config.get('current_view').upload_completed(queue_id, snapr_id);
        }
    };

    window.upload_cancelled = function( id ){
        if (typeof config.get('current_view').upload_cancelled == "function"){
            config.get('current_view').upload_cancelled( id );
        }
    };

    window.queue_settings = function(upload_mode, paused) {
        config.set('upload_mode', upload_mode);
        config.set('paused', paused);

        if(typeof config.get('current_view').queue_settings == "function") {
            config.get('current_view').queue_settings(upload_mode, paused);
        }
    };

    return native;
});
