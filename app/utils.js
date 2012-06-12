/*global _ Route snapr define require */
require(['jquery', 'auth', 'utils/local_storage', 'utils/local_storage'], function($, auth, local_storage) {

/* utils - this file should be split up into proper requirejs modules
***************************/

snapr.link_service = function(service, next){
    var url;
    if (service == 'twitter' && snapr.twitter_xauth){
        url = '#/twitter-xauth/?redirect='+ escape( next );
        Route.navigate( url );
    }else if (service == 'tumblr' && snapr.tumblr_xauth){
        url = '#/tumblr-xauth/?redirect='+ escape( next );
        Route.navigate( url );
    }else{
        if (local_storage.get( "appmode" )){
            if (local_storage.get("appmode") == 'iphone'){
                // double encode for iphone - the iOS code should be changed to handle it
                // without this so this can be removed in future
                url = snapr.api_base + "/linked_services/"+ service +
                    "/oauth/?display=touch&access_token=" + auth.get("access_token") +
                    "&double_encode=true&redirect=" + escape("snapr://redirect?url=" + escape( next ));
            }else if(local_storage.get("appmode") == 'android'){
                // android needs a snapr://link?url=
                url = "snapr://link?url=" + snapr.api_base +
                    "/linked_services/"+ service + "/oauth/?display=touch&access_token=" +
                    auth.get("access_token") + "&redirect=snapr://redirect?url=" +
                    escape( next );
            }else{
                // non-ios builds should be made to handle the redirect param escaped property so
                // this can be changed to escape("snapr://redirect?url=" + escape( window.location.href ))
                url = snapr.api_base + "/linked_services/"+ service + "/oauth/?display=touch&access_token=" +
                    auth.get("access_token") +
                    "&redirect=snapr://redirect?url=" + escape( next );
            }
        }else{
            url = snapr.api_base + "/linked_services/" + service +
                "/oauth/?display=touch&access_token=" + auth.get("access_token") +
                "&redirect=" + escape( next );
        }
        window.location = url;
    }
};

snapr.utils = {};

// defined differently so the function is hoisted for earlier use
snapr.utils.get_query_params = get_query_params;

function get_query_params(query) {
    var params = {};
    if(query && query.indexOf('=') > -1) {
        _.each(query.split('&'), function (part) {
            var kv = part.split('='),
                key = kv[0],
                value = kv[1];
            if(kv[0] == "zoom") {
                params[key] = parseInt(unescape(value));
            } else {
                if(_.indexOf(["access_token", "snapr_user"], key) > -1) {
                    var obj = {};
                    obj[kv[0]] = unescape(kv[1]);
                    auth.set(obj);
                } else if(_.indexOf(["snapr_user_public_group", "snapr_user_public_group_name", "appmode", "demo_mode", "environment", "browser_testing", "aviary", "camplus", "camplus_camera", "camplus_edit", "camplus_lightbox"], kv[0]) > -1) {
                    local_storage.save(key, value);
                } else {
                    key = unescape(key);
                    if(key in params) {
                        if(!_.isArray(params[key])) {
                            params[key] = [params[key]];
                        }
                        params[key].push(value);
                    } else {
                        params[key] = unescape(value);
                    }
                }
            }
        });
    }

    env = local_storage.get('environment');
    if (_.has(snapr.settings, env)){
        var settings = snapr.settings[env];
    }else{
        var settings = snapr.settings['default'];
    }
    _.each(settings, function(value, key){
        snapr[key] = value;
    });

    snapr.api_base = snapr.base_url + "/api";
    snapr.avatar_url = snapr.base_url + "/avatars";
    snapr.access_token_url = snapr.base_url + "/ext/oauth/access_token/";

    return params;
}
// alert/confirm replacements
snapr.utils.notification = function (title, text, callback) {
    var context = this;
    if(local_storage.get("appmode") == "iphone") {
        var par = {
            "title": title,
            "otherButton1": "OK",
            "alertID": 0
        };
        if(text) {
            par.message = text;
        }
        pass_data("snapr://alert?" + $.param(par));
    } else {
        if(text) {
            title = title + ': ' + text;
        }
        alert(title);
        if(_.isFunction(callback)) {
            $.proxy(callback, context)();
        }
    }
};

snapr.utils.approve = function (options) {
    var context = this;
    options = _.extend({
        'title': 'Are you sure?',
        'yes': 'Yes',
        'no': 'Cancel',
        'yes_callback': $.noop,
        'no_callback': $.noop
    }, options);

    if(local_storage.get("appmode") == 'iphone') {
        var actionID = tapped_action.add(options.yes_callback, options.no_callback);
        pass_data('snapr://action?' + $.param({
            'title': options.title,
            'destructiveButton': options.yes,
            'cancelButton': options.no,
            'actionID': actionID
        }));
    } else {
        if(confirm(options.title)) {
            $.proxy(options.yes_callback, context)();
        } else {
            $.proxy(options.no_callback, context)();
        }
    }
};
// what the app calls after an approve
function tapped_action(alertID, buttonIndex) {
    tapped_action.alerts[alertID][buttonIndex]();
    delete tapped_action.alerts[alertID];
}
tapped_action.alerts = {};
tapped_action.counter = 1;
tapped_action.add = function (yes, no) {
    var id = tapped_action.counter++;
    tapped_action.alerts[id] = {
        '-1': yes,
        '0': no
    };
    return id;
};

snapr.utils.get_photo_height = function (orig_width, orig_height, element) {
    var aspect = orig_width/orig_height,
        width = $(element).eq(0).width();

    //console.debug("orig_width: "+ orig_width + "orig_height: "+ orig_height + "width: "+ width);
    return width/aspect;
};

function spinner_start( text )
{
    $('.n-centered-loader .text').text(text || '');
    $('body').addClass('n-loading');
}

function spinner_stop()
{
    $('body').removeClass('n-loading');
}


// upload/appmode functions
function pass_data( url )
{
    //console.debug("pass data: ", url)
    window.location = url.replace(/\+/g, '%20');
}

function upload_progress( data, datatype )
{
    // data may be passed as an object or a string as specified via the data_type param
    // defualts to JSON object, if 'json_string' it will be a text string that needs to be parsed..
    // dont foget to convert it before you do anything with it..
    if (datatype == 'json_text')
    {
        data = JSON.parse(data);
    }

    if (data.uploads.length)
    {
        if (typeof snapr.info.current_view.upload_progress == "function")
        {
            snapr.info.current_view.upload_progress(data);
        }
    }
}

function upload_count( count )
{
    snapr.info.upload_count = count;

    if (typeof snapr.info.current_view.upload_count == "function")
    {
        snapr.info.current_view.upload_count(count);
    }
}

function upload_completed(queue_id, snapr_id)
{
    if (typeof snapr.info.current_view.upload_completed == "function")
    {
        snapr.info.current_view.upload_completed(queue_id, snapr_id);
    }
}

function upload_cancelled( id )
{
    if (typeof snapr.info.current_view.upload_cancelled == "function")
    {
        snapr.info.current_view.upload_cancelled( id );
    }
}

function queue_settings(upload_mode, paused) {
    snapr.info.upload_mode = upload_mode;
    snapr.info.paused = paused;

    if(typeof snapr.info.current_view.queue_settings == "function") {
        snapr.info.current_view.queue_settings(upload_mode, paused);
    }
}

/* jQuery extentions
***************************/

$.fn.x_loading = function(loading){
    if (loading !== false){
        loading = true;
    }
    this.each(function() {
        var element = $(this),
            details = element.data('button');
        if(details){
            element = details.button;
        }
        element.toggleClass('x-ajax-loading', loading);
    });
};

/* Query object - read and write querystrings
***************************/

function Query(input) {
    if(typeof (input) == "string") {
        this.query = this.parse(input);
    } else if(typeof (input) == "object") {
        this.query = input;
    }
}

Query.prototype.parse = function (querystring) {
    var params = {};
    $.each(querystring.split('&'), function (i, part) {
        var kv = part.split('='),
            key = unescape(kv[0]),
            value = unescape(kv[1]);
        if(key in params) {
            if(!$.isArray(params[key])) {
                params[key] = [params[key]];
            }
            params[key].push(value);
        } else {
            params[key] = value;
        }
    });
    return params;
};

Query.prototype.toString = function () {
    return $.param(this.query);
};

Query.prototype.remove = function (key) {
    delete this.query[key];
    return this;
};

Query.prototype.get = function (key) {
    return !(key in this.query) && arguments.length > 1 && arguments[1] || this.query[key];
};

Query.prototype.pop = function (key) {
    value = this.get.apply(this, arguments);
    this.remove(key);
    return value;
};

Query.prototype.set = function (key, value) {
    this.query[key] = value;
    return this;
};

window.Query = Query;

Number.prototype.zeroFill = function (width) {
    width -= this.toString().length;
    if(width > 0) {
        return new Array(width + (/\./.test(this) ? 2 : 1)).join('0') + this;
    }
    return this.toString();
};

Number.prototype.ordinal = function(){
    if( this!=11 && this!=12 && this!=13 ){
        that = String(this);
        switch( that.substr(that.length-1) ){
            case '1':
                return that+'st';
            case '2':
                return that+'nd';
            case '3':
                return that+'rd';
        }
    }
    return this+'th';
};

Array.prototype.human_list = function () {
    if(this.length == 1) {
        return this[0];
    }
    copy = this.slice(0);
    text = copy.pop();
    text = copy.pop() + ' and ' + text;
    while(copy.length) {
        text = copy.pop() + ', ' + text;
    }
    return text;
};
});
