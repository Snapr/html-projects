// Backbone.emulateHTTP = true;
// Overriding sync to make this a jsonp app
Backbone.sync = function( method, model, options )
{

    console.warn( "sync", method, model, options )

    // Helper function to get a URL from a Model or Collection as a property
    // or as a function.

    // sends the method as a parameter so that different methods can have
    // different urls.
    var getUrl = function( object, method )
    {
        if (!(object && object.url)) return null;
        return _.isFunction(object.url) ? object.url(method) : object.url;
    };
    
    // map RESTful methods to our API
    var method_map = {
        'create': 'POST',
        'update': 'POST',
        'delete': 'POST',
        'read'  : 'GET'
    }
    
    if (snapr.auth && snapr.auth.get('access_token'))
    {
        // if there is no .data attribute on the model set it from the model's id 
        // or just pass an empty object
        model.data = model.data && _.extend( model.data, model.attributes) || model.attributes || model.get('id') && {id:model.get('id')};
        model.data.access_token = snapr.auth.get('access_token');
    }
    
    // our hack to get jsonp to emulate http methods by appending them to the querystring
    if (method_map[method] !='GET')
    {
        var meth = '&_method=' + method_map[method]
    }
    else
    {
        var meth = '';
    }
    
    var url = getUrl(model,method);
    
    $.ajax({
        url: url + '?' + $.param(model.data || {}) + meth,
        type:'GET',
        // data is sent in the url only
        data: null,
        dataType: options.dataType || 'jsonp',
        processData: false,
        success: options.success,
        error: options.error
    });
};

Number.prototype.zeroFill = function( width )
{
    width -= this.toString().length;
    if ( width > 0 )
    {
        return new Array( width + (/\./.test( this ) ? 2 : 1) ).join( '0' ) + this;
    }
    return this.toString();
}

Array.prototype.human_list =  function(){
    if(this.length==1){return this[0];}
    copy = this.slice(0);
    text = copy.pop();
    text = copy.pop() +' and '+ text;
    while(copy.length){
       text = copy.pop() +', '+ text; 
    }
    return text
};


// defined in index.html
// snapr = {};
// snapr.models = {};
// snapr.routers = {};
// snapr.base_url = "https://sna.pr";
// snapr.api_base = snapr.base_url + "/api";
// snapr.access_token_url = snapr.base_url + "/ext/oauth/access_token/";


// PINK Nation Details:
snapr.client_id = "48611a3a325dc884c9d1722002be43ff";
snapr.client_secret = "a5b072ed71e89a4f0982944a4dd82d94";
// snapr.app_group = "pink-nation";

snapr.constants = {};
snapr.constants.default_zoom = 15;
snapr.constants.feed_count = 12;

snapr.constants.share_redirect = false;
// set to hash url to redirect after successful upload/share eg:
// snapr.constants.upload_redirect = "#/uploading/";
// if false, redirects to user feed

// store some info about the browser
snapr.info = {}
snapr.info.supports_local_storage = (function(){
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
})();

snapr.info.upload_count = 0;
snapr.info.upload_mode = "On";
snapr.info.upload_paused = false;
snapr.info.geolocation_enabled = true;
snapr.info.current_view = null;

snapr.auth = new snapr.models.auth();
snapr.auth.get_locally();

snapr.utils = {};
snapr.utils.date_to_snapr_format = function(d)
{
    return d.getFullYear()+'-'+(d.getMonth()+1).zeroFill(2)+'-'+d.getDate().zeroFill(2)+' 00:00:00';
}
snapr.utils.save_local_param = function( key, value )
{
    if (snapr.info.supports_local_storage)
    {
        localStorage.setItem( key, value);
    }
    else
    {
        $.cookie( key, value);
    }
}
snapr.utils.get_local_param = function( key )
{
    if (snapr.info.supports_local_storage)
    {
        return localStorage.getItem( key );
    }
    else
    {
        return $.cookie( key );
    }
}
snapr.utils.get_query_params = function(query)
{
    var params = {};
    if (query && query.indexOf('=') > -1)
    {
        _.each( query.split('&'), function(part)
        {
            var kv = part.split('=');
            switch (kv[0])
            {
                case "zoom":
                    params[kv[0]] = parseInt( unescape(kv[1]) );
                    break;
                default:
                    if (_.indexOf( ["access_token", "snapr_user"] , kv[0]) > -1)
                    {
                        var obj = {}
                        obj[kv[0]] = unescape( kv[1] );
                        snapr.auth.set(obj);
                    }
                    else if (_.indexOf( [
                        "snapr_user_public_group", 
                        "snapr_user_public_group_name", 
                        "appmode", 
                        "new_user", 
                        "demo_mode"
                        ], kv[0] ) > -1)
                    {
                        snapr.utils.save_local_param( kv[0], kv[1] );
                    }
                    else
                    {
                        params[ unescape( kv[0] ) ] = unescape( kv[1] );
                    }
                    break;
            }
        });
    }
    
    return params;
}
// alert/confirm replacements
snapr.utils.notification = function( title, text, callback ){
    var context = this;
    if (snapr.utils.get_local_param( "appmode" ) == "iphone")
    {
        var par = {
            "title": title,
            "otherButton1": "OK",
            "alertID": 0
        }
        if (text)
        {
            par.message = text;
        }
        window.location.href = "snapr://alert?" + $.param( par );
    }
    else
    {
        if (text)
        {
            title = title + ' ' + text;
        }
        alert( title );
        if (_.isFunction( callback ))
        {
            $.proxy( callback, context )();
        }
    }
}

snapr.utils.approve = function( options ){
    var context = this;
    options = _.extend({
        'title': 'Are you sure?',
        'yes': 'Yes',
        'no': 'Cancel',
        'yes_callback': $.noop,
        'no_callback': $.noop
    }, options);

    if (snapr.utils.get_local_param( "appmode" ) == 'iphone'){
        var actionID = snapr.utils.tapped_action.add(options.yes_callback, options.no_callback);
        window.location.href = 'snapr://action?'+$.param({
            'title': options.title,
            'destructiveButton': options.yes,
            'cancelButton': options.no,
            'actionID': actionID
        });
    }else{
        if(confirm(options.title)){
            $.proxy(options.yes_callback, context)();
        }else{
            $.proxy(options.no_callback, context)();
        }
    }
}
// what the app calls after an approve
snapr.utils.tapped_action = function( alertID, buttonIndex ){
    this.alerts[alertID][buttonIndex]();
    delete this.alerts[alertID];
}
snapr.utils.tapped_action.alerts = {};
snapr.utils.tapped_action.counter = 1;
snapr.utils.tapped_action.add = function( yes, no ){
    var id = this.counter++;
    this.alerts[id] = {'-1': yes, '0': no};
    return id;
}

snapr.utils.require_login = function( funct )
{
    return function( e )
    {
        if (!snapr.auth.get('access_token'))
        {
            if (e)
            {
                e.preventDefault();
            }
            Route.navigate( '#/login', true );
        }
        else
        {
            $.proxy(funct, this)(e);
        }
    };
}
snapr.utils.get_photo_height = function( orig_width, orig_height, element )
{
    // this depends on the padding - bit of a hack
    var aspect = orig_width/orig_height,
        width = $(element).eq(0).innerWidth() - 45;

    return width/aspect;
};

snapr.routers = Backbone.Router.extend({
    routes: {
        "/login/": "login",
        "/login/?:query_string": "login",
        "/logout/": "logout",
        "/join/": "join_snapr",
        "/join/?:query_string": "join_snapr",
        "/upload/": "upload",
        "/upload/?:query_string": "upload",
        "/uploading/": "uploading",
        "/uploading/?:query_string": "uploading",
        "/photo-edit/?:query_string": "photo_edit",
        "/my-account/": "my_account",
        "/my-account/?:query_string": "my_account",
        "/linked-services/?:query_string": "linked_services",
        "/feed/": "feed",
        "/feed/?:query_string": "feed",
        "/upload/": "upload",
        "/upload/?:query_string": "upload",
        "/photo-edit/?:query_string": "photo_edit",
        "/love-it/?:query_string": "love_it",
        "/": "home",
        "?:query_string": "home",
        "/?:query_string": "home",
        "*path": "home"
    },

    feed: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.feed({
            query: query,
            el: $("#feed")
        });
    },

    home: function( query_string )
    {
        console.warn('go home');
        snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.home({
            el: $('#home')
        });
    },
    
    login: function( query_string )
    {
        console.warn('go to login');
        snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.login();
    },
    
    logout: function( query_string )
    {
        snapr.utils.get_query_params( query_string );
        if (snapr.auth)
        {
           snapr.auth.logout();
        }
        else
        {
            snapr.auth = new snapr.models.auth;
        }
        window.location.hash = "";
    },
    
    join_snapr: function( query_string )
    {
        snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.join_snapr({
            el: $("upload")
        });
    },
    
    upload: function( query_string )
    {
        snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.upload({
            el: $("#upload")
        });
    },

    uploading: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.uploading({
            el: $("#uploading"),
            query: query
        });
    },

    photo_edit: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.photo_edit({
            el: $("#photo-edit"),
            query: query
        });
    },

    love_it: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.love_it({
            el: $("#love-it"),
            query: query
        });
    },
    
    my_account: function( query_string )
    {
        snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.my_account({
            el: $("#my-account")
        });
    },
    
    linked_services: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.linked_services({
            el: $("#linked-services"),
            query: query
        });
    }
});

// upload/appmode functions

function pass_data( url )
{
    window.location = url;
}

function upload_progress(data, datatype)
{
    // data may be passed as an object or a string as specified via the data_type param 
    // defualts to JSON object, if 'json_string' it will be a text string that needs to be parsed..    
    // dont foget to convert it before you do anything with it..
    if (datatype == 'json_text')
    {
        data = JSON.parse( data );
    }
    
    if (data.uploads.length)
    {
        if (typeof snapr.info.current_view.upload_progress == "function")
        {
            snapr.info.current_view.upload_progress( data )
        }
    }
    else
    {
        if (snapr.utils.get_local_param("appmode"))
        {
            pass_data( "snapr://upload_progress?send=false" );
        }
    }
}

function upload_count( count )
{
    snapr.info.upload_count = count;
    
    if (typeof snapr.info.current_view.upload_count == "function")
    {
        snapr.info.current_view.upload_count( count );
    }
}

function upload_completed( queue_id, snapr_id )
{
    if (typeof snapr.info.current_view.upload_completed == "function")
    {
        snapr.info.current_view.upload_completed( queue_id, snapr_id );
    }
}

function upload_cancelled( id )
{
    if (typeof snapr.info.current_view.upload_cancelled == "function")
    {
        snapr.info.current_view.upload_cancelled( id );
    }
}

function queue_settings( upload_mode, paused )
{
    snapr.info.upload_mode = upload_mode;
    snapr.info.paused  = paused;

    if (typeof snapr.info.current_view.queue_settings == "function")
    {
        snapr.info.current_view.queue_settings( upload_mode, paused );
    }
}


// end upload/appmode functions

$(function()
{
    // initialise router and start backbone
    Route = new snapr.routers;
    Backbone.history.start();
    $(document).trigger('snaprinit');
});