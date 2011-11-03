// Backbone.emulateHTTP = true;
// Overriding sync to make this a jsonp app
Backbone.sync = function(method, model, options) {
    // console.warn('Backbone.sync override',method, model, options.success, options.error);
    // Helper function to get a URL from a Model or Collection as a property
    // or as a function.
    var getUrl = function(object) {
      if (!(object && object.url)) return null;
      return _.isFunction(object.url) ? object.url() : object.url;
    };
    
    // map RESTful methods to our API    
    var method_map = {
        'create': 'POST',
        'update': 'POST',
        'delete': 'POST',
        'read'  : 'GET'
    }
    // console.warn('sync',model,model.data)
    
    if(tripmapper.auth && tripmapper.auth.get('access_token')){
        model.data.access_token = tripmapper.auth.get('access_token');
    }
    
    $.ajax({
        url: getUrl(model) + '?' + $.param(model.data),
        type: method_map[method]||'GET',
        // jsonp is read-only
        //contentType: 'application/json',
        data: null,
        // nothing to send
        dataType: 'jsonp',
        processData: false,
        success: options.success,
        error: options.error
    });
};

Number.prototype.zeroFill = function( width ){
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

// copied from snapr app - need to change
tripmapper.client_id = 'dbfedc9ed64f45644cbb13bcc3b422bb';
tripmapper.client_secret = 'e89d8304723d7d8be19ebb6ab8ca0364';
// tripmapper.auth = undefined;

tripmapper.base_url = "https://sna.pr";
tripmapper.api_base = tripmapper.base_url + "/api";
tripmapper.access_token_url = tripmapper.base_url + "/ext/oauth/access_token/";

if(!tripmapper.auth){
    tripmapper.auth = new tripmapper.models.auth;
    tripmapper.auth.url = tripmapper.access_token_url;
}

tripmapper.utils = {};
tripmapper.utils.date_to_snapr_format = function(d){
    return d.getFullYear()+'-'+(d.getMonth()+1).zeroFill(2)+'-'+d.getDate().zeroFill(2)+' 00:00:00'
}
tripmapper.utils.get_query_params = function(query){
    var params = {};
    if(query && query.indexOf('=') > -1){
        _.each(query.split('&'),function(part){
            var kv = part.split('=');
            params[kv[0]] = unescape(kv[1]);
        });
    }
    return params;
}



tripmapper.routers = Backbone.Router.extend({
    routes:{
        "login":"login",
        "logout":"logout",
        "feed":"feed",
        "feed/?:query":"feed",
        "user/:query":"user",
        "map":"map",
        "map/?:query":"map",
        "popular":"popular",
        "*path":"home"
    },
    feed: function(query){
        if(query){
            console.warn('go to feed', query);
        }
        var feed_view = new tripmapper.views.feed(query);
    },
    user: function(query){
        console.warn('go to user '+ query);
    },
    popular: function(){
        console.warn('go to popular');
        var popular_view = new tripmapper.views.popular;
    },
    home: function(){
        console.warn('go home');
        var home_view = new tripmapper.views.home;
    },
    login: function(){
        console.warn('go to login')
        var login_view = new tripmapper.views.login;
    },
    logout: function(){
        tripmapper.auth = new tripmapper.models.auth;
        window.location.hash = "";
    },
    map: function(query){
        console.warn("mapp");
        var map = new tripmapper.views.map(query);
    }
});

$(function(){
    // initialise router and start backbone
    Route = new tripmapper.routers;
    Backbone.history.start();
}())
