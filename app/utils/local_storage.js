/*global _ Route define require */
define(['jquery', 'cookie'], function($, cookie){

var local_storage = {};

local_storage.supported = (function () {
    try {
        return 'localStorage' in window && window.localStorage !== null;
    } catch(e) {
        return false;
    }
})();

local_storage.get = function(key) {
    if(local_storage.supported) {
        return localStorage.getItem(key);
    } else {
        return $.cookie(key);
    }
};

local_storage['delete'] = function (key) {
    if(local_storage.supported) {
        localStorage.removeItem(key);
    } else {
        $.cookie(key, null);
    }
};

local_storage.save = function( key, value ){
    if (value == "false"){
        local_storage['delete']( key );
    }else{
        if (local_storage.supported){
            localStorage.setItem( key, value );
        }else{
            $.cookie( key, value );
        }
    }

    // TODO: this is not the right place to be setting these.
    if (key == "appmode"){
        $("body").addClass("appmode-true").addClass("appmode-" + value);
    }
    if (key == "browser_testing"){
        $("body").addClass("browser-testing");
    }
    if (key == "aviary"){
        $("body").addClass("aviary");
    }
    if (key == "camplus"){
        $("body").addClass("camplus");
    }
    if (key == "camplus_camera"){
        $("body").addClass("camplus-camera");
    }
    if (key == "camplus_edit"){
        $("body").addClass("camplus-edit");
    }
    if (key == "camplus_lightbox"){
        $("body").addClass("camplus-lightbox");
    }

};

return local_storage;
});
