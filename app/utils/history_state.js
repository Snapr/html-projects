/*global _  define require */
define(['jquery', 'cookie'], function($, cookie){

var history_state = {};

history_state.replace = function(data) {
    window.history.replaceState(data, document.title, window.location);
};

history_state.get = function(key) {
    return history.state && history.state[key];
};

history_state['delete'] = function (key) {
    var state = history.state || {};
    delete state[key];
    history_state.replace(history.state);
};

history_state.set = function( key, value ){
    if (value == "false"){
        history_state['delete']( key );
    }else{
        var state = history.state || {};
        state[key] = value;
        history_state.replace(state);
    }
};

return history_state;
});
