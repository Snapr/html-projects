/*global _  requirejs require urlError */

require(['config'], function(config){
    // requiring config initalizes it
    window.config = config;  // export for templates
});

requirejs.config({
    paths: {
        "async": 'libs/require-plugins/async',

        "jquery": "libs/jquery-1.8.2",
        "jquery.mobile": "libs/jquery.mobile-1.2.0/jquery.mobile-1.2.0",
        "json": "libs/json2",
        "cookie": "libs/jq.cookie",
        "klass": "libs/klass.min",
        "photoswipe": "libs/photoswipe/code.photoswipe.jquery-3.0.5.min",
        "spin": "libs/spin.min",
        "underscore": "libs/underscore",
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
require(['routers'], function(routers){
    var routers_instance = new routers();
    // keep a ref to the instance so it can ba accessed if needed (see utils/dialog)
    routers.routers_instance = routers_instance;
});

require(['config', 'jquery', 'backbone', 'photoswipe', 'auth', 'utils/local_storage', 'native', 'utils/dialog', 'utils/alerts'],
    function(config, $, Backbone, PhotoSwipe, auth, local_storage, native, dialog, alerts) {

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
            // jQm runs a little experiment on dom ready to decide on this value
            // but it fails because our homescreen can't scroll, it's too short.
            // Doing this will probably stop the urlbar hiding in android browsers
            $.mobile.defaultHomeScroll = 0;
            $.mobile.hidePageLoadingMsg();
            // don't start history until jQm is ready to deal with pageCanges
            // also jQm must have finished it's init otherwise it will load the
            // "first page" - home - even if we requested another url
            Backbone.history.start();
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
                config.get('current_view').offline(true);
                $.mobile.hidePageLoadingMsg();
            }else if(config.get('offline') && (status == 'success' || status == 'notmodified')){
                config.set('offline', false);
                $.ajaxSetup({timeout:config.get('timeout')});
                config.get('current_view').offline(false);
            }
        };
    });

    $('.x-offline').live('click', function(){
        $('.x-offline').remove();
    });
    $('.x-offline .x-refresh').live('click', function(){
        $.ajaxSetup({timeout:config.get('timeout')});
        config.get('current_view').activate({'retry': true});
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
            $("body").addClass( "x-appmode-true" ).addClass("x-appmode-" + appmode );
        }else{
            $("body").addClass( "x-appmode-false" );
        }

        function class_if_local(param){
            // add dash-serperated class to body if localstorage param is true
            $("body").toggleClass( 'x-' + param.replace('_', '-'), !!local_storage.get( param ) );
        }

        class_if_local("browser_testing");
        class_if_local("aviary");
        if (local_storage.get( "camplus" )){
            class_if_local("camplus_camera");
            class_if_local("camplus_edit");
            class_if_local("camplus_lightbox");
        }

        $("body").toggleClass('x-tab-bar', !!config.get('show_tab_bar'));


        /* prevent dragging on some elements in appmode
        TODO: make this more efficiet
        ***************************/
        function preventScroll(e){
            e.preventDefault();
        }
        if (appmode){
            $(document).bind('pagechange', function(){
                $('.x-no-drag').unbind('touchmove', preventScroll).bind('touchmove', preventScroll);
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
        function launch_camera(event, extra_params){
            extra_params = extra_params || $(this).data('extra_params');

            var appmode = local_storage.get( "appmode" );
            var camplus = local_storage.get( "camplus" );
            var camplus_camera = local_storage.get( "camplus_camera" );

            if (appmode){
                if (camplus && camplus_camera){
                    native.pass_data( "snapr://camplus/camera/?" + extra_params );
                }else{
                    native.pass_data( "snapr://camera/?" + extra_params );

                    setTimeout( function(){
                        Backbone.history.navigate( "#/limbo/" );
                    }, 600);
                }
            }else{
                Backbone.history.navigate( "#/app/?" + extra_params );
            }
        }
        $(".x-launch-camera").live( "click", auth.require_login( launch_camera ));

        // photo library button
        function photo_library(event, extra_params){
            extra_params = extra_params || $(this).data('extra_params');

            var appmode = local_storage.get( "appmode" );
            var camplus = local_storage.get( "camplus" );
            var camplus_lightbox = local_storage.get( "camplus_lightbox" );

            if (appmode){
                if (camplus && camplus_lightbox){
                    native.pass_data( "snapr://camplus/lightbox/?" + extra_params );
                }else{
                    native.pass_data( "snapr://photo-library/?" + extra_params );

                    setTimeout( function(){
                        Backbone.history.navigate( "#/limbo/" );
                    }, 600);
                }
            }else{
                Backbone.history.navigate( "#/upload/?" + extra_params );
            }
        }
        $(".x-launch-photo-library").live( "click", auth.require_login( photo_library ) );

        // camera / photostream actionsheet
        $(".x-launch-camera-options").live( "click", auth.require_login( function(){
            var extra_params = $(this).data('extra_params');
            if(local_storage.get( "appmode" )){
                alerts.approve({
                    'title': 'Share Photo',
                    'yes': "Take Picture",
                    'no': "Use Existing",
                    'yes_callback': function(){launch_camera(null, extra_params);},
                    'no_callback': function(){photo_library(null, extra_params);}
                });
            }else{
                photo_library(null, extra_params);
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

// bind this here to prevent circular dependencies
require(['utils/alerts', 'collections/upload_progress'], function(alerts, upload_progress){
    upload_progress.on('error', function(id, error){
        alerts.notification('Upload Error', error || 'Unknown error');
    });
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


function test_upload(){
    var test_data={uploads:[{id:8888888,thumbnail:"http://media-server2.snapr.us/sml/dev/b1329ff1029c2a686ad78b94a66eea76/Z4K.jpg",upload_status:"active",percent_complete:50,status:"public",description:"Here's a cool photo of stuff!",location:{latitude:51.553978,location:"New York",longitude:-0.076529},date:"2011-04-12 20:50:10 +0100",shared:{tweeted:!0,facebook_newsfeed:!0,foursquare_checkin:!0,tumblr:!0,venue_id:123,venue_name:"some bar",venue_source:"Foursquare"}},{id:1111111,thumbnail:"http://media-server2.snapr.us/sml/04486f2ba3f8943a1136cacdd57ad62f/LOG.jpg",upload_status:"waiting",percent_complete:0,status:"private",description:"test2",location:{latitude:51.553978,location:"New York",longitude:-0.076529},date:"2011-04-12 20:50:10 +0100",shared:{tweeted:!0,facebook_newsfeed:!0,foursquare_checkin:!0,tumblr:!0,venue_id:123,venue_name:"some bar",venue_source:"Foursquare"}}]};
    setTimeout(function(){console.log("1:40",test_data);test_data.uploads[0].percent_complete=40;window.upload_progress(test_data);},1E3);
    setTimeout(function(){console.log("1:60",test_data);test_data.uploads[0].percent_complete=60;window.upload_progress(test_data);},3E3);
    setTimeout(function(){console.log("1:100",test_data);test_data.uploads[0].percent_complete=100;window.upload_progress(test_data);},5E3);
    setTimeout(function(){console.log("1:complete");window.upload_completed(8888888,"Z4K");},7E3);
    setTimeout(function(){console.log("2:50",test_data);test_data.uploads.shift();test_data.uploads[0].upload_status="active";test_data.uploads[0].percent_complete=50;window.upload_progress(test_data);},9E3);
    setTimeout(function(){console.log("2:100",test_data);test_data.uploads[0].percent_complete=100;window.upload_progress(test_data);},11E3);
    setTimeout(function(){console.log("2:complete");window.upload_completed(1111111,"LOG");},13E3);
    setTimeout(function(){console.log("2:removed",test_data);test_data.uploads.shift();window.upload_progress(test_data);},15E3);
}
