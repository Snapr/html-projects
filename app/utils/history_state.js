/*global _  define require */
define(['jquery', 'cookie'], function($, cookie){

var history_state = {state:{}};

// if this browser doesn't support history.state we need to haxxy it
if(history.state === undefined){
    $(window).bind('popstate', function(event) {
        history_state.state = event.originalEvent.state || {};
    });
}

history_state.replace = function(data) {
    window.history.replaceState(data, document.title, window.location);
};

history_state.get_state = function() {
    // prefer history.state if browser supports it
    if(window.history.state !== undefined){
        return window.history.state || {};
    }
    return history_state.state;
};

history_state.get = function(key) {
    return history_state.get_state()[key];
};

history_state['delete'] = function (key) {
    var state = history_state.get_state();
    delete state[key];
    history_state.replace(history.state);
};

history_state.set = function( key, value ){
    if (value == "false"){
        history_state['delete']( key );
    }else{
        var state = history_state.get_state();
        state[key] = value;
        history_state.replace(state);
    }
};

return history_state;
});
