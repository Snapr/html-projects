snapr.settings = {
    'dev': {
        'base_url': "http://dev.sna.pr",
        'client_id': "client",
        'client_secret': "secret"
      },
      'live': {
          'base_url': "https://sna.pr",
          'client_id':'76e5be0eec71b28fb4380b0ac42201cf',
          'client_secret':'d293011a0a17dfc8aa191455af4ab7ba'
        },
      'default': {
        'base_url': "http://dev.sna.pr",
        'client_id': "client",
        'client_secret': "secret"
      },
      'local': {
        'base_url': "http://localhost:8000",
        'client_id': "client",
        'client_secret': "secret"
      }
};

// App Group Here
// snapr.app_group = "pink-nation";
// snapr.public_group = "pink-nation-featured";

snapr.constants = {};
snapr.constants.default_zoom = 15;
snapr.constants.feed_count = 12;

snapr.tumblr_xauth = true;
snapr.twitter_xauth = true;

// set to hash url to redirect after successful upload/share eg:
snapr.constants.share_redirect = "#/uploading/?";
// snapr.constants.share_redirect = false;
// if false, redirects to user feed

// Backbone.emulateHTTP = true;
// Overriding sync to make this a jsonp app
Backbone.sync = function (method, model, options) {

    //console.debug( "sync", method, model, options );
    // Helper function to get a URL from a Model or Collection as a property
    // or as a function.
    // sends the method as a parameter so that different methods can have
    // different urls.
    var getUrl = function (object, method) {
            if(!(object && object.url)) return null;
            return _.isFunction(object.url) ? object.url(method) : object.url;
        };

    // map RESTful methods to our API
    var method_map = {
        'create': 'POST',
        'update': 'POST',
        'delete': 'POST',
        'read': 'GET'
    };

    var type = method_map[method];
    // Default options, unless specified.
    options = options || {};

    // give model the change to prepare it's data
    var data;
    if(model.prep_data && $.isFunction(model.prep_data)){
        data = model.prep_data(method, options);
    }else{
        data = model.data || model.attributes || model.get('id') && {id: model.get('id')} || {};
    }
    // Default JSON-request options.
    var params = {
        type: type,
        dataType: 'jsonp',
        data: data
    };
    // Ensure that we have a URL.
    if (!options.url) {
      params.url = getUrl(model, method) || urlError();
    }

    // auth
    if(snapr.auth && snapr.auth.get('access_token')) {
        params.data.access_token = snapr.auth.get('access_token');
    }

    if(snapr.app_group && !params.data.app_group) {
        params.data.app_group = snapr.app_group;
    }

    // our hack to get jsonp to emulate http methods by appending them to the querystring
    if(method_map[method] != 'GET') {
        params.data._method = method_map[method];
        params.type = 'GET';
    }

    // deep extend data
    if(options.data){
        options.data = _.extend(params.data, options.data);
    }


    // Make the request, allowing the user to override any Ajax options.
    return $.ajax(_.extend(params, options));

};

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


// store some info about the browser
snapr.info = {};
snapr.info.supports_local_storage = (function () {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch(e) {
        return false;
    }
})();

/*********
 * make photoswipe basebar click
 ***************************/
$('.ps-caption').live('vclick', function(){
    var ps = Code.PhotoSwipe.activeInstances[0].instance,
        src = ps.cache.images[ps.currentIndex].src,
        id = src.match('/(.{2,6})\.jpg$')[1];
    ps.hide();
    Route.navigate('#/feed/?n=1&photo_id=' + id );
});

snapr.info.upload_count = 0;
snapr.info.upload_mode = "On";
snapr.info.upload_paused = false;
snapr.info.geolocation_enabled = true;
snapr.info.current_view = null;

// used to hold upload progress views
snapr.pending_uploads = {};

snapr.auth = new snapr.models.auth();
snapr.auth.get_locally();

snapr.link_service = function(service, next){
    if (service == 'twitter' && snapr.twitter_xauth){
        url = '#/twitter-xauth/?redirect='+ escape( next );
        Route.navigate( url );
    }else if (service == 'tumblr' && snapr.tumblr_xauth){
        url = '#/tumblr-xauth/?redirect='+ escape( next );
        Route.navigate( url );
    }else{
        if (snapr.utils.get_local_param( "appmode" )){
            if (snapr.utils.get_local_param("appmode") == 'iphone'){
                // double encode for iphone - the iOS code should be changed to handle it
                // without this so this can be removed in future
                url = snapr.api_base + "/linked_services/"+ service +
                    "/oauth/?display=touch&access_token=" + snapr.auth.get("access_token") +
                    "&double_encode=true&redirect=" + escape("snapr://redirect?url=" + escape( next ));
            }else if(snapr.utils.get_local_param("appmode") == 'android'){
                // android needs a snapr://link?url=
                url = "snapr://link?url=" + snapr.api_base +
                    "/linked_services/"+ service + "/oauth/?display=touch&access_token=" +
                    snapr.auth.get("access_token") + "&redirect=snapr://redirect?url=" +
                    escape( next );
            }else{
                // non-ios builds should be made to handle the redirect param escaped property so
                // this can be changed to escape("snapr://redirect?url=" + escape( window.location.href ))
                url = snapr.api_base + "/linked_services/"+ service + "/oauth/?display=touch&access_token=" +
                    snapr.auth.get("access_token") +
                    "&redirect=snapr://redirect?url=" + escape( next );
            }
        }else{
            url = snapr.api_base + "/linked_services/" + service +
                "/oauth/?display=touch&access_token=" + snapr.auth.get("access_token") +
                "&redirect=" + escape( next );
        }
        window.location = url;
    }
}

snapr.utils = {};
snapr.utils.set_header_back_btn_text = function( el, back_text )
{
    $(el).find("[data-role='header'] .ui-btn-left").remove();
    $(el).attr("data-back-btn-text", back_text || "Back");
    if ( $(el).data("page") && $(el).data("page").options )
    {
        $(el).data("page").options.backBtnText = back_text || "Back";
        $(el).trigger("pagecreate");
    }
};
snapr.utils.plural = function( n )
{
    return (n > 1) ? "s" : "";
};
snapr.utils.amp_join = function( array_of_strings )
{
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
}
snapr.utils.at_links = function( comment )
{
    if (comment.length)
    {
        var atcomment = comment.replace( /[@]+[A-Za-z0-9-_]+/g,
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
}
snapr.utils.comment_links = function( comment )
{
    var hashedcomment = snapr.utils.hashtag_links( comment );
    var output = snapr.utils.at_links( hashedcomment );
    return output;
}

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
        ap = 'AM'
    }
    else
    {
        var hours = date.getHours() -12,
        ap = 'PM'
    }
    if (relative !== false){
        if ( isNaN(day_diff) || day_diff < 0 )//|| day_diff >= 31 )
            return;
        if (day_diff == 0){
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
        return full_date
    return full_date+', '+date.getFullYear()
}

snapr.utils.short_location = function(txt)
{
    txt_array = txt.split(', ');
    new_txt_array = [];
    new_txt_array.push(txt_array[0]);
    if (txt_array.length > 1){
        if (txt_array[0].length + txt_array[1].length < 24){
            new_txt_array.push(txt_array[1]);
        }
    }
    return new_txt_array.join( ", " );
}
snapr.utils.save_local_param = function( key, value )
{
    if (value == "false")
    {
        snapr.utils.delete_local_param( key );
    }
    else
    {
        if (snapr.info.supports_local_storage)
        {
            localStorage.setItem( key, value );
        }
        else
        {
            $.cookie( key, value );
        }
    }

    if (key == "appmode")
    {
        $("body").addClass("appmode-true").addClass("appmode-" + value);
    }
    if (key == "browser_testing")
    {
        $("body").addClass("browser-testing");
    }
    if (key == "aviary")
    {
        $("body").addClass("aviary");
    }
    if (key == "camplus")
    {
        $("body").addClass("camplus");
    }
    if (key == "camplus_camera")
    {
        $("body").addClass("camplus-camera");
    }
    if (key == "camplus_edit")
    {
        $("body").addClass("camplus-edit");
    }
    if (key == "camplus_lightbox")
    {
        $("body").addClass("camplus-lightbox");
    }

};

// defined differently so the function is hoisted for earlier use
snapr.utils.get_local_param = get_local_param;
function get_local_param (key) {
    if(snapr.info.supports_local_storage) {
        return localStorage.getItem(key);
    } else {
        return $.cookie(key);
    }
}
snapr.utils.delete_local_param = function (key) {
    if(snapr.info.supports_local_storage) {
        localStorage.removeItem(key);
    } else {
        $.cookie(key, null);
    }
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
                    snapr.auth.set(obj);
                } else if(_.indexOf(["snapr_user_public_group", "snapr_user_public_group_name", "appmode", "demo_mode", "environment", "browser_testing", "aviary", "camplus", "camplus_camera", "camplus_edit", "camplus_lightbox"], kv[0]) > -1) {
                    snapr.utils.save_local_param(key, value);
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

    env = snapr.utils.get_local_param('environment');
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
    if(snapr.utils.get_local_param("appmode") == "iphone") {
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

    if(snapr.utils.get_local_param("appmode") == 'iphone') {
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

snapr.utils.require_login = function (funct) {
    return function (e) {
        if(!snapr.auth.has('access_token')) {
            if(e) {
                e.preventDefault();
            }
            Route.navigate('#/login/?message=Sorry, you need to log in first.');
        } else {
            $.proxy(funct, this)(e);
        }
    };
};
snapr.utils.get_photo_height = function (orig_width, orig_height, element) {
    var aspect = orig_width/orig_height,
        width = $(element).eq(0).width();

    //console.debug("orig_width: "+ orig_width + "orig_height: "+ orig_height + "width: "+ width);
    return width/aspect;
};


snapr.geo = {};
snapr.geo.location_callbacks = [],
snapr.geo.location_error_callbacks = [],

snapr.geo.get_location = function ( success, error )
{
    // if in appmode, ask the app for location, otherwise try html5 geolocation
    if (snapr.utils.get_local_param( "appmode" ))
    {
        // TODO: what is there is no response!? need timeout function.
        snapr.geo.location_callbacks.push( success );
        snapr.geo.location_callbacks.push( error );
        if (window.override && window.override( "snapr://get_location" ))
        {
            //do nothing
        }else
        {
            if (snapr.utils.get_local_param( "appmode" ) == "android")
            {
                // android locks up the UI for like 30 seconds whenever it tries to lookup the location, so we are caching the curr location, and only getting the
                // new location is if the cached value is greater than 5 minutes old. TODO: this should really be done android-side
                var cached_location = snapr.geo.get_cached_geolocation();
                if (cached_location != null)
                {
                    success( cached_location );
                }
                else
                {
                    pass_data( "snapr://get_location" );
                }
            } else {
                pass_data( "snapr://get_location" );
            }
        }
    }
    else
    {
        if (navigator.geolocation)
        {
            navigator.geolocation.getCurrentPosition( success, error );
        }
        else
        {
            error( "Geolocation is not supported by your browser." );
        }
    }
}

/* only used for android */
snapr.geo.get_cached_geolocation = function()
{
    if (snapr.info.supports_local_storage)
    {
        var now = new Date().getTime();
        if (localStorage.getItem('curr_geolocation') != undefined
            && now < localStorage.getItem('geolocation_cache_expires'))
        {
            return JSON.parse(localStorage.getItem('curr_geolocation'));
        }
        else
        {
            return null;
        }
    }
    else
    {
        return null;
    }
}

/* only used for android */
snapr.geo.set_cached_geolocation = function( location )
{
    var geolocation_cache_time = 1000*60*5; //5 minutes in milliseconds
    if (snapr.info.supports_local_storage)
    {
        var now = new Date().getTime();
        if (localStorage.getItem('geolocation_cache_expires') == undefined
            || localStorage.getItem('geolocation_cache_expires') < now)
        {
            localStorage.setItem('geolocation_cache_expires', now + geolocation_cache_time);
            localStorage.setItem('curr_geolocation', JSON.stringify( location ));
        }
    }
}

snapr.geo.set_location = function( latitude, longitude )
{
    while (snapr.geo.location_callbacks.length)
    {
        snapr.geo.location_callbacks.pop()({
            coords: {
                latitude: latitude,
                longitude: longitude
            }
        });
    }
};
snapr.geo.location_error = function( error )
{
    while (snapr.geo.location_error_callbacks.length)
    {
        snapr.geo.location_error_callbacks.pop()( error );
    }
};

function photoswipe_init(id, elements){
    if (elements.length){
        // detach the previous photoswipe instance if it exists
        var photoSwipeInstance = Code.PhotoSwipe.getInstance( id );

        if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance !== null){
            Code.PhotoSwipe.detatch(photoSwipeInstance);
        }

        // make sure we set the param backButtonHideEnabled:false to prevent photoswipe from changing the hash
        photoSwipeInstance = elements
            .photoSwipe( {
                backButtonHideEnabled: false,
                preventSlideshow: true,
                captionAndToolbarFlipPosition: true,
                allowUserZoom: false
            }, id );
    }
}

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

function set_location(latitude, longitude)
{
    snapr.geo.set_location(latitude, longitude);
}

function location_error(error)
{
    snapr.geo.location_error(error);
}


$(".x-launch-camera").live( "click", snapr.utils.require_login( function ()
{
    var appmode = snapr.utils.get_local_param( "appmode" );
    var camplus = snapr.utils.get_local_param( "camplus" );
    var camplus_camera = snapr.utils.get_local_param( "camplus_camera" );

    if (appmode)
    {
        if (camplus && camplus_camera)
        {
            pass_data( "snapr://camplus/camera/" );
        }
        else
        {
            pass_data( "snapr://camera" );
        }

        setTimeout( function()
        {
            Route.navigate( "#/limbo/" );
        }, 600);
    }
    else
    {
        Route.navigate( "#/app/" );
    }
}) );

$(".x-launch-photo-library").live( "click", snapr.utils.require_login( function()
{
    var appmode = snapr.utils.get_local_param( "appmode" );
    var camplus = snapr.utils.get_local_param( "camplus" );
    var camplus_lightbox = snapr.utils.get_local_param( "camplus_lightbox" );

    if (appmode)
    {
        if (camplus && camplus_lightbox)
        {
            pass_data( "snapr://camplus/lightbox/" );
        }
        else
        {
            pass_data( "snapr://photo-library" );
        }

        setTimeout( function()
        {
            Route.navigate( "#/limbo/" );
        }, 600);
    }
    else
    {
        Route.navigate( "#/upload/" );
    }
}) );

// handle dialog links
$("a[data-snapr-dialog='true']").live("vclick", function( e )
{
    e.preventDefault();

    var routeStripper = /^[#\/]/;
    var stripped_link = e.currentTarget.hash.replace( routeStripper, "");

    var snapr_url = stripped_link.split("?")[0].replace( routeStripper, "");
    var query_string = stripped_link.split("?")[1];

    //console.debug("dialog", snapr_url, query_string);
    snapr.routers.prototype[ snapr.routers.prototype.routes[ snapr_url ]  ]( query_string, snapr.info.current_view );
});

// end upload/appmode functions
$(function () {
    // initialise router and start backbone
    Route = new snapr.routers();
    Backbone.history.start();
    var appmode = snapr.utils.get_local_param("appmode");
    if (appmode)
    {
        $("body").addClass( "appmode-true" ).addClass("appmode-" + appmode );
    }
    else
    {
        $("body").addClass( "appmode-false" );
    }

    if (snapr.utils.get_local_param( "browser_testing" ))
    {
        $("body").addClass( "browser-testing" );
    }
    if (snapr.utils.get_local_param( "aviary" ))
    {
        $("body").addClass( "aviary" );
    }
    if (snapr.utils.get_local_param( "camplus" ))
    {
        if (snapr.utils.get_local_param( "camplus_camera" ))
        {
            $("body").addClass( "camplus-camera" );
        }
        if (snapr.utils.get_local_param( "camplus_edit" ))
        {
            $("body").addClass( "camplus-edit" );
        }
        if (snapr.utils.get_local_param( "camplus_lightbox" ))
        {
            $("body").addClass( "camplus-lightbox" );
        }
    }


    $(document).trigger( "snaprinit" );

    function preventScroll( e )
    {
        e.preventDefault();
    }
    if (appmode)
    {
        $(document).bind('pagechange', function()
        {
            $('.no-drag').unbind('touchmove', preventScroll).bind('touchmove', preventScroll);
        });
    }

});

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
