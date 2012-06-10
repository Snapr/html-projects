/*global _:false Route:false requirejs:false define:false require:false urlError:false */
var snapr = {};
snapr.models = {};
snapr.views = {};
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
    'local': {
        'base_url': "http://localhost:8000",
        'client_id': "client",
        'client_secret': "secret"
    }
};
snapr.settings['default'] = snapr.settings.dev;

snapr.constants = {};
snapr.constants.default_zoom = 15;  // for map
snapr.constants.feed_count = 9;
snapr.constants.share_redirect = "#/uploading/?";  // set to hash url to redirect after successful upload/share. if false, redirects to user feed

// client must have xAuth permission from 3rd party
snapr.tumblr_xauth = true;
snapr.twitter_xauth = true;

requirejs.config({
    paths: {
        "jquery": "libs/jquery-1.7.1.min",
        "jquery.mobile": "libs/jquery.mobile-1.1.0/jquery.mobile-1.1.0",
        "json": "libs/json2",
        "cookie": "libs/jq.cookie",
        "klass": "libs/klass.min",
        "photoswipe": "libs/photoswipe/code.photoswipe.jquery-3.0.4.min",
        "spin": "libs/spin.min",
        "underscore": "libs/underscore-min",
        "backbone": "libs/backbone",
        "iscroll": "libs/iscroll",
        "validate": "libs/jquery.validate.min",
        "mobiscroll": "libs/mobiscroll/mobiscroll-2.0rc2.full.min"
    },
    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'cookie': ['jquery'],
        'validate': ['jquery'],
        'photoswipe': {
            deps: ['jquery', 'klass'],
            exports: 'Code.PhotoSwipe'
        },
        'iscroll': {
            exports: 'iScroll'
        }
    }
});

/* store some info about the environment
***************************/
snapr.info = {};
snapr.info.upload_count = 0;
snapr.info.upload_mode = "On";
snapr.info.upload_paused = false;
snapr.info.geolocation_enabled = true;
snapr.info.current_view = null;

/* routers
***************************/
require(['routers', 'backbone'], function(routers, Backbone){
    window.Route = new routers();
    snapr.routers = routers;
    // don't start history until jQm id ready to deal with pageCanges
    $(window).on("pagecontainercreate", function(){ Backbone.history.start(); });
});

require(['jquery'], function($) {

    /* disable jquery-mobile's hash nav so we can replace it with backbone.js
    ***************************/
    $(document).bind("mobileinit", function(){
        $.mobile.ignoreContentEnabled = true;
        $.mobile.ajaxEnabled = false;
        $.mobile.pushStateEnabled = false;
        $.mobile.hashListeningEnabled = false;
        $.mobile.defaultPageTransition = 'none';
        $.mobile.buttonMarkup.hoverDelay = 0;
    });
    // now we can load jQmobile
    require(['jquery.mobile'], function(){
        // Now jQm is loaded and applied styles we can show everything.
        $(document.body).show();
    });
});

require(['jquery', 'backbone', 'photoswipe', 'auth', 'utils/local_storage'], function($, Backbone, PhotoSwipe, auth, local_storage) {


    /* offline mode / timeout
    ***************************/
    // there is come code in our Backbone.sync for this too
    snapr.offline = false;
    snapr.timeout = 20000; // 20000;
    snapr.offline_timeout = 5000;  // 5000;
    $.ajaxSetup({timeout:snapr.timeout});

    snapr.retry_connection = function(){
        $.ajaxSetup({timeout:snapr.timeout});
        window.location.reload();
    };

    $('.x-offline').live('click', snapr.retry_connection);

    /* Overriding Backbone.sync
    ***************************/
    // make this a jsonp app and deal with snapr api things
    Backbone.sync = function (method, model, options) {

        // Helper function to get a URL from a Model or Collection as a property or as a function.
        // sends the method as a parameter so that different methods can have different urls.
        var getUrl = function (object, method) {
                if(!(object && object.url)){ return null; }
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
        if(auth && auth.get('access_token')) {
            params.data.access_token = auth.get('access_token');
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

        // control offline mode
        if(options.complete){
            options._complete = options.complete;
        }
        options.complete = function(xhr, status){
            if(options._complete){
                options._complete.call(this, status, xhr);
            }
            if(status == 'timeout'){
                snapr.offline = true;
                $.ajaxSetup({timeout:snapr.offline_timeout});
                snapr.current_view.$('[data-role=content]').prepend(snapr.offline_el);
            }else if(snapr.offline && (status == 'success' || status == 'notmodified')){
                snapr.offline = false;
                $.ajaxSetup({timeout:snapr.timeout});
                $('.x-offline').remove();
            }
        };

        // Make the request, allowing the user to override any Ajax options.
        return $.ajax(_.extend(params, options));

    };

    $(function () {

        /* setup body classes - used to turn features on and off
        ***************************/
        var appmode = local_storage.get("appmode");
        if (appmode){
            $("body").addClass( "appmode-true" ).addClass("appmode-" + appmode );
        }else{
            $("body").addClass( "appmode-false" );
        }

        function class_if_local(param){
            // add dash-serperated class to body if localstorage param is true
            $("body").toggleClass( param.replace('_', '-'), !!local_storage.get( param ) );
        }

        class_if_local("browser_testing");
        class_if_local("aviary");
        if (local_storage.get( "camplus" )){
            class_if_local("camplus_camera");
            class_if_local("camplus_edit");
            class_if_local("camplus_lightbox");
        }


        /* prevent dragging on some elements in appmode
        ***************************/
        function preventScroll(e){
            e.preventDefault();
        }
        if (appmode){
            $(document).bind('pagechange', function(){
                $('.no-drag').unbind('touchmove', preventScroll).bind('touchmove', preventScroll);
            });
        }


        /* global live click hadlers
        ***************************/

        // make photoswipe basebar click
        $('.ps-caption').live('vclick', function(){
            var ps = PhotoSwipe.activeInstances[0].instance,
                src = ps.cache.images[ps.currentIndex].src,
                id = src.match(/\/(\w{2,6})\.jpg$/)[1];
            ps.hide();
            Route.navigate('#/feed/?n=1&photo_id=' + id );
        });

        // camera button
        $(".x-launch-camera").live( "click", auth.require_login( function (){
            var appmode = local_storage.get( "appmode" );
            var camplus = local_storage.get( "camplus" );
            var camplus_camera = local_storage.get( "camplus_camera" );

            if (appmode){
                if (camplus && camplus_camera){
                    pass_data( "snapr://camplus/camera/" );
                }else{
                    pass_data( "snapr://camera" );
                }

                setTimeout( function(){
                    Route.navigate( "#/limbo/" );
                }, 600);
            }else{
                Route.navigate( "#/app/" );
            }
        }) );

        // photo library button
        $(".x-launch-photo-library").live( "click", auth.require_login( function(){
            var appmode = local_storage.get( "appmode" );
            var camplus = local_storage.get( "camplus" );
            var camplus_lightbox = local_storage.get( "camplus_lightbox" );

            if (appmode){
                if (camplus && camplus_lightbox){
                    pass_data( "snapr://camplus/lightbox/" );
                }else{
                    pass_data( "snapr://photo-library" );
                }

                setTimeout( function(){
                    Route.navigate( "#/limbo/" );
                }, 600);
            }else{
                Route.navigate( "#/upload/" );
            }
        }) );

        // handle dialog links
        $("a[data-snapr-dialog='true']").live("vclick", function( e ){
            e.preventDefault();

            var routeStripper = /^[#\/]/;
            var stripped_link = e.currentTarget.hash.replace( routeStripper, "");

            var snapr_url = stripped_link.split("?")[0].replace( routeStripper, "");
            var query_string = stripped_link.split("?")[1];

            //console.debug("dialog", snapr_url, query_string);
            snapr.routers.prototype[ snapr.routers.prototype.routes[ snapr_url ]  ]( query_string, snapr.info.current_view );
        });


        /* go directly to page if requested
        ***************************/
        var redirect = window.location.hash.replace('#','');
        if(redirect.length){
            Route.navigate(redirect);
        }

    });

});

// defines function for native code to call
require(['native'], function(){});
