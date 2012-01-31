// Backbone.emulateHTTP = true;
// Overriding sync to make this a jsonp app
Backbone.sync = function( method, model, options )
{

    // console.warn( "sync", method, model, options )

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
        model.data = model.data && _.extend( model.data, model.attributes) || model.attributes || model.get('id') && {id:model.get('id')} || {};
        model.data.access_token = snapr.auth.get('access_token');
    }

    if (snapr.app_group)
    {
        _.extend( model.data, {app_group: snapr.app_group});
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
// snapr.public_group = "pink-nation-featured";

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

    if (key == "appmode")
    {
        $("body").addClass("appmode").addClass("appmode-" + value);
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
snapr.utils.delete_local_param = function( key )
{
    if (snapr.info.supports_local_storage)
    {
        localStorage.removeItem( key );
    }
    else
    {
        $.cookie( key, null );
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
        pass_data( "snapr://alert?" + $.param( par ) );
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
        var actionID = tapped_action.add(options.yes_callback, options.no_callback);
        pass_data('snapr://action?'+$.param({
            'title': options.title,
            'destructiveButton': options.yes,
            'cancelButton': options.no,
            'actionID': actionID
        }) );
    }else{
        if(confirm(options.title)){
            $.proxy(options.yes_callback, context)();
        }else{
            $.proxy(options.no_callback, context)();
        }
    }
}
// what the app calls after an approve
function tapped_action( alertID, buttonIndex ){
    tapped_action.alerts[alertID][buttonIndex]();
    delete tapped_action.alerts[alertID];
}
tapped_action.alerts = {};
tapped_action.counter = 1;
tapped_action.add = function( yes, no ){
    var id = tapped_action.counter++;
    tapped_action.alerts[id] = {'-1': yes, '0': no};
    return id;
}

snapr.utils.require_login = function( funct )
{
    return function( e )
    {
        if (!snapr.auth.has('access_token'))
        {
            if (e)
            {
                e.preventDefault();
            }
            Route.navigate( '#/login/?message=Sorry, you need to log in first.', true );
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

var opts = {
  lines: 12, // The number of lines to draw
  length: 7, // The length of each line
  width: 4, // The line thickness
  radius: 10, // The radius of the inner circle
  speed: 1, // Rounds per second
  trail: 60, // Afterglow percentage
  shadow: false // Whether to render a shadow
};


$.fn.spin = function(opts) {
  this.each(function() {
    var $this = $(this),
        spinner = $this.data('spinner');

    if (spinner) spinner.stop();
    if (opts !== false) {
      opts = $.extend({color: $this.css('color'), width: 4, length: 7}, opts);
      spinner = new Spinner(opts).spin(this);
      $this.data('spinner', spinner);
    }
  });
  return this;
};



snapr.routers = Backbone.Router.extend({
    routes: {
        "/login/": "login",
        "/login/?*query_string": "login",
        "/logout/": "logout",
        "/join/": "join_snapr",
        "/join/?*query_string": "join_snapr",
        "/upload/": "upload",
        "/upload/?*query_string": "upload",
        "/uploading/": "uploading",
        "/uploading/?*query_string": "uploading",
        "/photo-edit/?*query_string": "photo_edit",
        "/love-it/?*query_string": "love_it",
        "/my-account/": "my_account",
        "/my-account/?*query_string": "my_account",
        "/linked-services/": "linked_services",
        "/linked-services/?*query_string": "linked_services",
        "/connect/": "connect",
        "/connect/?*query_string": "connect",
        "/limbo/": "limbo",
        "/limbo/?*": "limbo",
        "/feed/": "feed",
        "/feed/?*query_string": "feed",
        "/pink-hearts/": "pink_hearts",
        "/pink-hearts/?*query_string": "pink_hearts",
        "/map/": "map",
        "/map/?*query_string": "map",
        "/popular/": "popular",
        "/popular/?*query_string": "popular",
        "/search/": "search",
        "/search/?*query_string": "search",
        "/user/profile/?*query_string": "user_profile",
        "/user/search/?*query_string": "user_search",
        "/user/:follow/?*query_string": "people",
        "/": "home",
        "?*query_string": "home",
        "/?*query_string": "home",
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

    pink_hearts: function( query_string )
    {
        snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.pink_hearts({
            el: $("#pink-hearts")
        });
    },

    home: function( query_string )
    {
        snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.home({
            el: $('#home')
        });
    },

    login: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.login({
            el: $('#login'),
            query: query
        });
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
    },

    connect: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.connect({
            el: $("#connect"),
            query: query
        })
    },

    limbo: function( query_string )
    {
        snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.limbo({
            el: $("#limbo")
        })
    },

    map: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.map( {query: query} );
    },

    popular: function( query_string )
    {
        snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.popular();
    },

    search: function( query_string )
    {
        snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.search();
    },

    user_profile: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.user_profile({
            query: query,
            el: $("#user-profile")
        });
    },

    user_search: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.people({
            query: query,
            el: $("#people")
        });
    },

    people: function( follow, query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.people({
            query: query,
            follow: follow,
            el: $("#people")
        });
    }


});

function spinner_start(){
    $('body').addClass('n-loading');
}
function spinner_stop(){
    $('body').removeClass('n-loading');
}


// upload/appmode functions

function pass_data( url )
{
    window.location = url.replace(/\+/g, '%20');
}

function topbar(show)
{
    if (snapr.utils.get_local_param("appmode"))
    {
        // pass_data("snaprkit-parent://topbar/?show=" + show ? "true": "false" );
    }
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

$(".x-launch-camera").live( "click", function()
{
    // console.warn("camera");
    if (snapr.utils.get_local_param("appmode"))
    {
        pass_data("snapr://camera");
    }
    else
    {
        Route.navigate( '#/upload/', true );
    }
});

$(".x-launch-photo-library").live( "click", function()
{
    // console.warn("camera-roll");
    if (snapr.utils.get_local_param("appmode"))
    {
        pass_data("snapr://photo-library");
    }
    else
    {
        Route.navigate( '#/upload/', true );
    }

});

// end upload/appmode functions

$(function()
{
    snapr.SnapOverlay = function(type, data, map, extra_class)
    {
        // image as JS object in format the snapr api returns
        this.type_ = type;
        this.data_ = data;
        this.map_ = map;
        this.extra_class_ = extra_class;

        // We define a property to hold the image's
        // div. We'll actually create this div
        // upon receipt of the add() method so we'll
        // leave it null for now.
        this.div_ = null;

        // Explicitly call setMap() on this overlay
        this.setMap(map);
    }

    snapr.SnapOverlay.prototype = new google.maps.OverlayView();
    snapr.SnapOverlay.prototype.onAdd = function()
    {
        // Note: an overlay's receipt of onAdd() indicates that
        // the map's panes are now available for attaching
        // the overlay to the map via the DOM.

        var data_id = this.data_.id;

        if (this.type_ == 'photo') {
            var div = $(this.map.snapr.thumb_template({photo:this.data_}));
            div.show();
        } else {  //spot
            var div = $(this.map.snapr.spot_template({spot:this.data_}));
            div.show();
        }

        // Set the overlay's div_ property to this DIV
        this.div_ = div;

        // We add an overlay to a map via one of the map's panes.
        // We'll add this overlay to the overlayImage pane.
        var panes = this.getPanes();
        $(panes.floatPane).append(this.div_);
    }
    snapr.SnapOverlay.prototype.draw = function()
    {
        var overlayProjection = this.getProjection();
        var position = new google.maps.LatLng( this.data_.location.latitude, this.data_.location.longitude );
        var px = overlayProjection.fromLatLngToDivPixel( position );

        this.div_ = this.div_
            .css('position', 'absolute')
            .css('left', px.x + 'px')
            .css('top', px.y + 'px');
    }
    snapr.SnapOverlay.prototype.onRemove = function()
    {
        $(this.div_).remove();
        this.div_ = null;
    }
    snapr.SnapOverlay.prototype.hide = function()
    {
        if (this.div_)
        {
          this.div_.style.visibility = "hidden";
        }
    }
    snapr.SnapOverlay.prototype.show = function()
    {
        if (this.div_)
        {
          this.div_.style.visibility = "visible";
        }
    }
    snapr.SnapOverlay.prototype.toggle = function()
    {
        if (this.div_)
        {
          if (this.div_.style.visibility == "hidden")
          {
            this.show();
          }
          else
          {
            this.hide();
          }
        }
    }
    snapr.SnapOverlay.prototype.toggleDOM = function()
    {
        if (this.getMap())
        {
          this.setMap( null );
        }
        else
        {
          this.setMap( this.map_ );
        }
    }

    // initialise router and start backbone
    Route = new snapr.routers;
    Backbone.history.start();
    if (snapr.utils.get_local_param( "appmode" ))
    {
        $("body").addClass("appmode").addClass("appmode-" + snapr.utils.get_local_param( "appmode" ));
    }
    $('.n-centered-loader .spinner').spin({
        lines: 12,
        length: 7,
        width: 4,
        radius: 10,
        color: '#000',
        speed: 1,
        trail: 60,
        color:'#efefee'
    });
    spinner_stop();
    $(document).trigger('snaprinit');
});