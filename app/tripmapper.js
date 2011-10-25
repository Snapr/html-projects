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
function date_to_snapr_format(d){
    return d.getFullYear()+'-'+(d.getMonth()+1).zeroFill(2)+'-'+d.getDate().zeroFill(2)+' 00:00:00'
}

// defined in index.html
// tripmapper = {};
// tripmapper.models = {};
// tripmapper.routers = {};

tripmapper.routers = Backbone.Router.extend({
    routes:{
        "feed/:query":"feed",
        "user/:query":"user",
        "popular":"popular",
        "popular/:query":"popular",
        "*path":"home"
    },
    feed: function(query){
        console.warn('go to feed', query);
    },
    user: function(query){
        console.warn('go to user '+ query);
    },
    popular: function(query){
        console.warn('go to popular');
        var popular_view = new tripmapper.views.popular;
        popular_view.update_list();
    },
    home: function(){
        console.warn('go home');
        if($.mobile.activePage && $.mobile.activePage.find("#menu").length < 1){
            $.mobile.changePage("#menu");
        }
        window.location.hash = "";
    }
    
});

Route = new tripmapper.routers;

Backbone.history.start();