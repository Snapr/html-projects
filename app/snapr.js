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
        model.data = model.data || model.get('id') && {id:model.get('id')} || model.attributes || {};
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
        url: url + '?' + $.param(model.data) + meth,
        type:'GET',
        // data is sent in the url only
        data: null,
        dataType: 'jsonp',
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

// defined in index.html
// snapr = {};
// snapr.models = {};
// snapr.routers = {};
// snapr.base_url = "https://sna.pr";
// snapr.api_base = snapr.base_url + "/api";
// snapr.access_token_url = snapr.base_url + "/ext/oauth/access_token/";


// copied from snapr app - need to change
snapr.client_id = 'dbfedc9ed64f45644cbb13bcc3b422bb';
snapr.client_secret = 'e89d8304723d7d8be19ebb6ab8ca0364';

snapr.constants = {}
snapr.constants.default_zoom = 15;
snapr.constants.feed_count = 12;

// store some info about the browser
snapr.info = {}
snapr.info.supports_local_storage = (function(){
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
})();

snapr.info.appmode = (window.location.protocol == 'file:');
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
                        snapr.info[ kv[0] ] = unescape( kv[1] );
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
snapr.utils.notification = function( title, text, callback )
{
    // todo - for now we just use an alert
    alert(title + ' ' + text);
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
        "/login": "login",
        "/logout": "logout",
        "/join": "join_snapr",
        "/search": "search",
        "/my-account": "my_account",
        "/feed": "feed",
        "/feed/?:query_string": "feed",
        "/user/profile/?:query": "user_profile",
        "/user/search/?:query": "user_search",
        "/user/:follow/?:query": "people",
        "/map": "map",
        "/map/?:query_string": "map",
        "/popular": "popular",
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

    popular: function()
    {
        console.warn('go to popular');
        snapr.info.current_view = new snapr.views.popular();
    },
    
    home: function()
    {
        console.warn('go home');
        snapr.info.current_view = new snapr.views.home({
            el: $('#home')
        });
    },
    
    login: function()
    {
        console.warn('go to login')
        snapr.info.current_view = new snapr.views.login();
    },
    
    logout: function()
    {
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
    
    join_snapr: function()
    {
        snapr.info.current_view = new snapr.views.join_snapr();
    },
    
    my_account: function()
    {
        snapr.info.current_view = new snapr.views.my_account({
            el: $("#my-account")
        });
    },
    
    map: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.map( {query: query} );
    },
    
    search: function()
    {
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
        if (snapr.info.appmode)
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
    $(document).trigger('snaprinit');
});