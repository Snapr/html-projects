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
    console.warn('sync',model,model.data)
    
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

// defined in index.html
// tripmapper = {};
// tripmapper.models = {};
// tripmapper.routers = {};

tripmapper.routers = Backbone.Router.extend({
    routes:{
        "user/:query":"user",
        "popular":"popular",
        "popular/:time":"popular",
        "*path":"home"
    },
    home: function(){
        console.warn('go home');
        if($.mobile.activePage && $.mobile.activePage.find("#menu").length < 1){
            $.mobile.changePage("#menu");
        }
    },
    user: function(query){
        console.warn('go to user '+ query);
    },
    popular: function(time){
        console.warn('go to popular');
        // p is the collection which will contain the photos
        p = new tripmapper.models.photo_collection();
        p.url = "https://sna.pr/api/search/";
        p.data = {
            sort:"favorite_count",
            n:20
        }
        if(time){
            p.data.min_date = time;
            $.mobile.loadingMessage = "Loading popular photos from " + time;
            $.mobile.showPageLoadingMsg();
        }else{
            $.mobile.loadingMessage = "Loading popular photos";
            $.mobile.showPageLoadingMsg();
        }
        p.fetch({
            success:function(){
                console.warn('success',p);
                var popular_list = new tripmapper.views.thumbs_list({
                    collection:p,
                    el:$('#popular ul').eq(0)
                });
                popular_list.render();
            },
            error:function(){
                console.warn('error');
                $.mobile.hidePageLoadingMsg();
            }
        })
    }
    
});

Route = new tripmapper.routers;

Backbone.history.start();