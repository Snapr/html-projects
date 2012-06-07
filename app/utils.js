/*global _ Route snapr define require */
require(['jquery', 'auth', 'utils/local_storage', 'utils/local_storage'], function($, auth, local_storage) {

/* utils
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
snapr.utils.plural = function( n ){
    return (n > 1) ? "s" : "";
};
snapr.utils.amp_join = function( array_of_strings ){
    if (arrray_of_strings.length == 1)
    {
        return arrray_of_strings[0];
    }
    else if (arrray_of_strings.length > 1)
    {
        return arrray_of_strings.slice( 0, arrray_of_strings.length -1 ).join(", ") +
            ", &amp; " + arrray_of_strings[arrray_of_strings.length - 1];
    }
    else
    {
        return "";
    }
};
snapr.utils.hashtag_links = function( comment )
{
    if (comment.length)
    {
        var hashcomment = comment.replace( /[#]+[A-Za-z0-9-_]+/g,
        function( k )
        {
            var keyword = k.replace('#', '');
            return '<a href="#/feed/?keywords=' + keyword + '">' + k + '</a>';
        });
        return hashcomment;
    }
    else
    {
        return "";
    }
};
snapr.utils.at_links = function( comment )
{
    if (comment.length)
    {
        var atcomment = comment.replace( /[@]+[A-Za-z0-9\-_]+/g,
        function( u )
        {
            return '<a href="#/feed/?keywords=' + u + '">' + u + '</a>';
        });
        return atcomment;
    }
    else
    {
        return "";
    }
};
snapr.utils.comment_links = function( comment )
{
    var hashedcomment = snapr.utils.hashtag_links( comment );
    var output = snapr.utils.at_links( hashedcomment );
    return output;
};

snapr.utils.date_to_snapr_format = function (d) {
    return d.getFullYear() + '-' + (d.getMonth() + 1).zeroFill(2) + '-' + d.getDate().zeroFill(2) + ' 00:00:00';
};
snapr.utils.convert_snapr_date = function(time){
    time = (time || "").replace(/-/g,"/").replace(/ \//g," -").replace(/[TZ]/g," ");
    return new Date(time);
};
snapr.utils.short_timestamp = function( time, relative )
{
    time = (time || "").replace(/-/g,"/").replace(/ \//g," -").replace(/[TZ]/g," ");
    //add 0000 to set to utc for relative times
    if (relative !== false && time.split(' ').length <3){
        time = time + ' -0000';
    }
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    date = new Date(time),now = new Date(),
    diff = ((now.getTime() - date.getTime()) / 1000),
    day_diff = Math.floor(diff / 86400);
    date = new Date(time.replace(/ [\+-]\d{4}$/,'')); //strip TZ
    if (date.getHours() <= 12){
        var hours = date.getHours(),
        ap = 'AM';
    }
    else
    {
        var hours = date.getHours() -12,
        ap = 'PM';
    }
    if (relative !== false){
        if ( isNaN(day_diff) || day_diff < 0 )//|| day_diff >= 31 )
            return;
        if (day_diff === 0){
            return(
                diff < 60 && 'just now' ||
                diff < 3600 && Math.floor( diff / 60 ) + "min" ||
                diff < 86400 && Math.floor( diff / 3600 ) + "h ago"
            );
        }
        if (day_diff == 1){
            return 'Yesterday';
        }
        if (day_diff < 7){
            return day_diff + 'd ago';
        }
        if (date.getYear() == now.getYear()){
            return (date.getDate()).ordinal() + ' ' + months[date.getMonth()];
        }
        else
        {
            var yr = String( date.getFullYear() );
            yr = yr.substring(yr.length - 2,yr.length);
            return (date.getDate()).ordinal() + ' ' + months[date.getMonth()] + ' \'' + yr;
        }
    }
    var full_date = hours+' '+ap+', '+months[date.getMonth()]+' '+date.getDate();
    if (date.getFullYear() == new Date().getFullYear())
        return full_date;
    return full_date+', '+date.getFullYear();
};

snapr.utils.short_location = function(txt){
    txt_array = txt.split(', ');
    new_txt_array = [];
    new_txt_array.push(txt_array[0]);
    if (txt_array.length > 1){
        if (txt_array[0].length + txt_array[1].length < 24){
            new_txt_array.push(txt_array[1]);
        }
    }
    return new_txt_array.join( ", " );
};

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
