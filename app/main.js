/*global _  requirejs require urlError */

require(['config'], function(config){
    config.set({
        //environment: 'live',  // defaults to dev

        // client must have xAuth permission from 3rd party
        tumblr_xauth: true,
        twitter_xauth: true,

        //app_group: 'group-slug',

        //zoom: 15, // for map
        //feed_count: 9, // number of images to show in feed views
        share_redirect: "#/uploading/?"  // set to hash url to redirect after successful upload/share. Defaults to user feed
    });

    window.config = config;  // export for templates
});

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

/* routers
***************************/
require(['routers', 'backbone'], function(routers, Backbone){
    var routers_instance = new routers();
    // keep a ref to the instance so it can ba accessed if needed (see utils/dialog)
    routers.routers_instance = routers_instance;
    // don't start history until jQm is ready to deal with pageCanges
    $(window).on("pagecontainercreate", function(){ Backbone.history.start(); });
});

require(['config', 'jquery', 'backbone', 'photoswipe', 'auth', 'utils/local_storage', 'native', 'utils/dialog', 'views/components/offline'],
    function(config, $, Backbone, PhotoSwipe, auth, local_storage, native, dialog, offline_el) {

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

        // jQm triggers showPageLoadingMsg on dom-ready, do not want.
        $(function(){
            $.mobile.hidePageLoadingMsg();
        });

    });

    /* offline mode / timeout
    ***************************/
    $.ajaxSetup({timeout:config.get('timeout')});

    $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
        var old_complete = options.complete;
        options.complete = function(xhr, status){
            if(old_complete){
                old_complete.call(this, status, xhr);
            }
            if(!options.no_offline_mode && status == 'timeout'){
                config.set('offline', true);
                $.ajaxSetup({timeout:config.get('offline_timeout')});
                config.get('current_view').$('[data-role=content]').prepend(offline_el).trigger("create");
            }else if(config.get('offline') && (status == 'success' || status == 'notmodified')){
                config.set('offline', false);
                $.ajaxSetup({timeout:config.get('timeout')});
                $('.x-offline').remove();
            }
        };
    });

    $('.x-offline').live('click', function(){
        $('.x-offline').remove();
    });
    $('.x-offline .x-refresh').live('click', function(){
        $.ajaxSetup({timeout:config.get('timeout')});
        window.location.reload();
    });

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

        if(config.get('app_group') && !params.data.app_group) {
            params.data.app_group = config.get('app_group');
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
            Backbone.history.navigate('#/feed/?n=1&photo_id=' + id );
        });

        // camera button
        $(".x-launch-camera").live( "click", auth.require_login( function (){
            var appmode = local_storage.get( "appmode" );
            var camplus = local_storage.get( "camplus" );
            var camplus_camera = local_storage.get( "camplus_camera" );

            if (appmode){
                if (camplus && camplus_camera){
                    native.pass_data( "snapr://camplus/camera/" );
                }else{
                    native.pass_data( "snapr://camera" );
                }

                setTimeout( function(){
                    Backbone.history.navigate( "#/limbo/" );
                }, 600);
            }else{
                Backbone.history.navigate( "#/app/" );
            }
        }) );

        // photo library button
        $(".x-launch-photo-library").live( "click", auth.require_login( function(){
            var appmode = local_storage.get( "appmode" );
            var camplus = local_storage.get( "camplus" );
            var camplus_lightbox = local_storage.get( "camplus_lightbox" );

            if (appmode){
                if (camplus && camplus_lightbox){
                    native.pass_data( "snapr://camplus/lightbox/" );
                }else{
                    native.pass_data( "snapr://photo-library" );
                }

                setTimeout( function(){
                    Backbone.history.navigate( "#/limbo/" );
                }, 600);
            }else{
                Backbone.history.navigate( "#/upload/" );
            }
        }) );

        // handle dialog links to stop them changing the url
        $("a[data-snapr-dialog='true']").live("vclick", function( e ){
            var hash = Backbone.history.getHash({location: e.currentTarget});
            var fragment = Backbone.history.getFragment(hash);

            var matched = dialog(fragment);

            if(matched){
                e.preventDefault();
            }
        });


        /* go directly to page if requested
        ***************************/
        var redirect = window.location.hash.replace('#','');
        if(redirect.length){
            Backbone.history.navigate(redirect);
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

});

// export utils for templates to use
require(['utils/string'], function(string_utils) {
    window.string_utils = string_utils;

    window.get_photo_height = function (orig_width, orig_height, element) {
        var aspect = orig_width/orig_height,
            width = $(element).eq(0).width();
        //console.debug('Getting height for', element, 'width:', $(element).eq(0).width(), 'height:', width/aspect);
        return width/aspect;
    };
});


