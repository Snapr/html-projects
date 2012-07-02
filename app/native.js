/*global define */
define(['config', 'collections/upload_progress'], function(config, upload_progress){
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

    function run_if_function(thing){
        if($.isFunction(thing)){
            return thing;
        }else{
            return $.noop;
        }
    }

    window.upload_progress = function( data, datatype ){
        console.log('upload_completed', data, datatype);
        // data may be passed as an object or a string as specified via the data_type param
        // defualts to JSON object, if 'json_string' it will be a text string that needs to be parsed..
        // dont foget to convert it before you do anything with it..
        if (datatype == 'json_text'){
            data = JSON.parse(data);
        }

        // jam these in backwards so when the first add or change even is fired it's that of the latest upload
        upload_progress.update(data.uploads.slice().reverse());

        if (data.uploads.length){
            run_if_function(config.get('current_view').upload_progress)(data);
        }
    };

    window.upload_count = function( count ){
        config.set('upload_count', count);

        run_if_function(config.get('current_view').upload_count)(count);
    };

    window.upload_completed = function(queue_id, snapr_id){
        console.log('upload_completed', queue_id, snapr_id);
        var model = upload_progress.get(queue_id);
        if(model){
            model.set({
                id: snapr_id,
                queue_id: queue_id
            }).trigger('complete', model, queue_id);
        }else{
            console.warn('tried to set '+queue_id+'s id to '+snapr_id+' but it doesnt exist');
        }

        run_if_function(config.get('current_view').upload_completed)(queue_id, snapr_id);
    };

    window.upload_cancelled = function( id ){
        upload_progress.remove(id);

        run_if_function(config.get('current_view').upload_cancelled)(id);
    };

    window.queue_settings = function(upload_mode, paused) {
        config.set('upload_mode', upload_mode);
        config.set('paused', paused);

        run_if_function(config.get('current_view').queue_settings)(upload_mode, paused);
    };

    return native;
});
