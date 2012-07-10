/*global _  define require */
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

local_storage.set = function( key, value ){
    if (value == "false"){
        local_storage['delete']( key );
    }else{
        if (local_storage.supported){
            localStorage.setItem( key, value );
        }else{
            $.cookie( key, value );
        }
    }
};
local_storage.save = function( key, value ){
    console.warn('local_storage.save should be local_storage.set');
    local_storage.set(key, value);
};

return local_storage;
});
