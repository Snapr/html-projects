// Backbone.emulateHTTP = true;
// Overriding sync to make this a jsonp app
Backbone.sync = function(method, model, options) {

    // Helper function to get a URL from a Model or Collection as a property
    // or as a function.

    // sends the method as a parameter so that different methods can have
    // different urls.
    var getUrl = function(object,method) {
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
    
    if(tripmapper.auth && tripmapper.auth.get('access_token')){
        // if there is no .data attribute on the model set it from the model's id 
        // or just pass an empty object
        model.data = model.data || model.get('id') && {id:model.get('id')} || {};
        model.data.access_token = tripmapper.auth.get('access_token');
    }
    
    // our hack to get jsonp to emulate http methods by appending them to the querystring
    if(method_map[method] !='GET'){
        meth = '&_method=' + method_map[method]
    }else{
        meth = '';
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
// tripmapper.base_url = "https://sna.pr";
// tripmapper.api_base = tripmapper.base_url + "/api";
// tripmapper.access_token_url = tripmapper.base_url + "/ext/oauth/access_token/";


// copied from snapr app - need to change
tripmapper.client_id = 'dbfedc9ed64f45644cbb13bcc3b422bb';
tripmapper.client_secret = 'e89d8304723d7d8be19ebb6ab8ca0364';

// store some info about the browser
tripmapper.info = {}
tripmapper.info.supports_local_storage = (function() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
})();

tripmapper.auth = new tripmapper.models.auth;
tripmapper.auth.get_locally();

tripmapper.utils = {};
tripmapper.utils.date_to_snapr_format = function(d){
    return d.getFullYear()+'-'+(d.getMonth()+1).zeroFill(2)+'-'+d.getDate().zeroFill(2)+' 00:00:00'
}
tripmapper.utils.get_query_params = function(query){
    var params = {};
    if(query && query.indexOf('=') > -1){
        _.each(query.split('&'),function(part){
            var kv = part.split('=');
            if(kv[0] == 'zoom'){
                params[kv[0]] = parseInt(unescape(kv[1]));
            }else{
                params[kv[0]] = unescape(kv[1]);
            }
        });
    }
    return params;
}
tripmapper.utils.require_login = function(funct){
    return function(e){
        if(!tripmapper.auth.get('access_token')){
            if(e){
                e.preventDefault();
            }
            Route.navigate('#login',true)
        }else{
            $.proxy(funct, this)(e);
        }
    };
}
tripmapper.utils.get_photo_height = function(orig_width, orig_height, element){
    console.warn('get height', orig_width, orig_height, element, $(element).eq(0).innerWidth())
    var aspect = orig_width/orig_height,
        // this depends on the padding - bit of a hack
        width = $(element).eq(0).innerWidth() - 45;
    return width/aspect;
};



tripmapper.routers = Backbone.Router.extend({
    routes:{
        "login":"login",
        "logout":"logout",
        "join":"join_snapr",
        "my-account":"my_account",
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
        if(tripmapper.auth){
           tripmapper.auth.logout();
        }else{
            tripmapper.auth = new tripmapper.models.auth;
        }
        window.location.hash = "";
    },
    join_snapr: function(){
        var join_snapr = new tripmapper.views.join_snapr;
    },
    my_account: function(){
        var my_account = new tripmapper.views.my_account;
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
