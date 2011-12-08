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
    
    if (tripmapper.auth && tripmapper.auth.get('access_token'))
    {
        // if there is no .data attribute on the model set it from the model's id 
        // or just pass an empty object
        model.data = model.data || model.get('id') && {id:model.get('id')} || model.attributes || {};
        model.data.access_token = tripmapper.auth.get('access_token');
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
// tripmapper = {};
// tripmapper.models = {};
// tripmapper.routers = {};
// tripmapper.base_url = "https://sna.pr";
// tripmapper.api_base = tripmapper.base_url + "/api";
// tripmapper.access_token_url = tripmapper.base_url + "/ext/oauth/access_token/";


// copied from snapr app - need to change
tripmapper.client_id = 'dbfedc9ed64f45644cbb13bcc3b422bb';
tripmapper.client_secret = 'e89d8304723d7d8be19ebb6ab8ca0364';

tripmapper.constants = {}
tripmapper.constants.default_zoom = 15;


// store some info about the browser
tripmapper.info = {}
tripmapper.info.supports_local_storage = (function(){
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
})();

tripmapper.auth = new tripmapper.models.auth();
tripmapper.auth.get_locally();

tripmapper.utils = {};
tripmapper.utils.date_to_snapr_format = function(d)
{
    return d.getFullYear()+'-'+(d.getMonth()+1).zeroFill(2)+'-'+d.getDate().zeroFill(2)+' 00:00:00';
}
tripmapper.utils.get_query_params = function(query)
{
    var params = {};
    if (query && query.indexOf('=') > -1)
    {
        _.each( query.split('&'), function(part)
        {
            var kv = part.split('=');
            if(kv[0] == 'zoom')
            {
                params[kv[0]] = parseInt( unescape(kv[1]) );
            }
            else
            {
                params[kv[0]] = unescape( kv[1] );
            }
        });
    }
    
    return params;
}
tripmapper.utils.notification = function( title, text, callback )
{
    // todo - for now we just use an alert
    alert(title + ' ' + text);
}
tripmapper.utils.require_login = function( funct )
{
    return function( e )
    {
        if (!tripmapper.auth.get('access_token'))
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
tripmapper.utils.get_photo_height = function( orig_width, orig_height, element )
{
    // this depends on the padding - bit of a hack
    var aspect = orig_width/orig_height,
        width = $(element).eq(0).innerWidth() - 45;

    return width/aspect;
};

tripmapper.routers = Backbone.Router.extend({
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
        var query = tripmapper.utils.get_query_params( query_string );
        var feed_view = new tripmapper.views.feed({
            query: query,
            el: $("#feed")
        });
    },

    popular: function()
    {
        console.warn('go to popular');
        var popular_view = new tripmapper.views.popular;
    },
    
    home: function()
    {
        console.warn('go home');
        var home_view = new tripmapper.views.home({
            el: $('#home')
        });
    },
    
    login: function()
    {
        console.warn('go to login')
        var login_view = new tripmapper.views.login;
    },
    
    logout: function()
    {
        if (tripmapper.auth)
        {
           tripmapper.auth.logout();
        }
        else
        {
            tripmapper.auth = new tripmapper.models.auth;
        }
        window.location.hash = "";
    },
    
    join_snapr: function()
    {
        var join_snapr = new tripmapper.views.join_snapr;
    },
    
    my_account: function()
    {
        var my_account = new tripmapper.views.my_account({
            el: $("#my-account")
        });
    },
    
    map: function( query_string )
    {
        var query = tripmapper.utils.get_query_params( query_string );
        var map_view = new tripmapper.views.map( {query: query} );
    },
    
    search: function()
    {
        var search = new tripmapper.views.search();
    },
    
    user_profile: function( query_string )
    {
        var query = tripmapper.utils.get_query_params( query_string );
        var user_profile = new tripmapper.views.user_profile({
            query: query,
            el: $("#user-profile")
        });
    },
    
    user_search: function( query_string )
    {
        var query = tripmapper.utils.get_query_params( query_string );
        var people = new tripmapper.views.people({
            query: query,
            el: $("#people")
        });
    },
    
    people: function( follow, query_string )
    {
        var query = tripmapper.utils.get_query_params( query_string );
        var people = new tripmapper.views.people({
            query: query,
            follow: follow,
            el: $("#people")
        });
    }
});

$(function()
{
    tripmapper.SnapOverlay = function(type, data, map, extra_class)
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

    tripmapper.SnapOverlay.prototype = new google.maps.OverlayView();
    tripmapper.SnapOverlay.prototype.onAdd = function()
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
    tripmapper.SnapOverlay.prototype.draw = function()
    {
        var overlayProjection = this.getProjection();
        var position = new google.maps.LatLng( this.data_.location.latitude, this.data_.location.longitude );
        var px = overlayProjection.fromLatLngToDivPixel( position );

        this.div_ = this.div_
            .css('position', 'absolute')
            .css('left', px.x + 'px')
            .css('top', px.y + 'px');
    }
    tripmapper.SnapOverlay.prototype.onRemove = function()
    {
        $(this.div_).remove();
        this.div_ = null;
    }
    tripmapper.SnapOverlay.prototype.hide = function()
    {
        if (this.div_)
        {
          this.div_.style.visibility = "hidden";
        }
    }
    tripmapper.SnapOverlay.prototype.show = function()
    {
        if (this.div_)
        {
          this.div_.style.visibility = "visible";
        }
    }
    tripmapper.SnapOverlay.prototype.toggle = function()
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
    tripmapper.SnapOverlay.prototype.toggleDOM = function()
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
    Route = new tripmapper.routers;
    Backbone.history.start();
    $(document).trigger('tripmapperinit');
});