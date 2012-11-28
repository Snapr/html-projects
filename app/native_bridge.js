/*global define _ */
define(['config', 'collections/upload_progress'], function(config, upload_progress_collection){
    //export

    // we can't to this here because geo relises on pass_data - circ.dep.
    // window.set_location = geo.set_location;
    // window.location_error = geo.location_error;

    // we can't to this here because alerts relises on pass_data - circ.dep.
    // window.tapped_action = alerts.tapped_action;

    var native_bridge = {};
    native_bridge.pass_data = function( url ){
        console.log("pass_data", url);
        var iframe = document.createElement("IFRAME");
        iframe.setAttribute("src", url);
        document.documentElement.appendChild(iframe);
        iframe.parentNode.removeChild(iframe);
        iframe = null;
    };

    window.back = function(){
        config.get('current_view').back();
    };

    function run_if_function(thing){
        if($.isFunction(thing)){
            return thing;
        }else{
            return $.noop;
        }
    }

    window.upload_progress = function( data ){
        // data may be passed as an object or a string
        if (_.isString(data)){
            data = JSON.parse(data);
        }

        // jam these in backwards so when the first add or change event that is fired it's for the latest upload
        upload_progress_collection.update(data.uploads.slice().reverse());

        if (data.uploads.length){
            run_if_function(config.get('current_view').upload_progress)(data);
        }
    };

    window.upload_count = function( count ){
        // config.set('upload_count', count);

        // if (count === 0){
        //     window.upload_progress({uploads:[]});
        // }

        // run_if_function(config.get('current_view').upload_count)(count);
    };

    window.upload_completed = function(queue_id, snapr_id){
        var model = upload_progress_collection.get(queue_id);
        if(model){
            model.set({
                id: snapr_id,
                queue_id: queue_id
            }).trigger('complete', model, queue_id);
            upload_progress_collection.remove(model);
        }else{
            console.warn('tried to set '+queue_id+'s id to '+snapr_id+' but it doesnt exist');
        }

        run_if_function(config.get('current_view').upload_completed)(queue_id, snapr_id);
    };

    window.upload_cancelled = function( id ){
        upload_progress_collection.remove(id);

        run_if_function(config.get('current_view').upload_cancelled)(id);
    };

    window.upload_failed = function(id, error){
        //upload_progress.remove(id);
        upload_progress_collection.trigger('error', id, error);

        run_if_function(config.get('current_view').upload_failed)(id, error);
    };

    window.queue_settings = function(upload_mode, paused) {
        config.set('upload_mode', upload_mode);
        config.set('upload_paused', paused);
    };

    window.upload_sharing_failed  = function(photo_id, services){
        window.location.hash = "#/connect/?to_link=" + services.join(',') + "&photo_id=" + photo_id + "&redirect_url=" + escape(window.location.hash);
    };

    return native_bridge;
});
