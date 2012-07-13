/*global _ define */
define(['backbone'], function(Backbone) {
var config_model = Backbone.Model.extend({

    config: {
        //environment: 'live',  // defaults to dev

        // client must have xAuth permission from 3rd party
        //tumblr_xauth: false,
        //twitter_xauth: false,

        //app_group: 'group-slug',

        //zoom: 15, // for map
        // feed_count: 9, // number of images to show in feed views
        // map_count: 10, // number of images to show on the map
        // side_scroll_initial: 6, // numbers of images to show in side-scrollers initially
        // side_scroll_more: 10, // number of extra images to load into side-scrollers when "load more" is activated
        // activity_count: 25,  // how many items to load in activity page
        // share_redirect: "#/uploading/?"  // set to hash url to redirect after successful upload/share.
    },
    environments: {
        'dev': {
            'base_url': "http://dev.sna.pr",
            'client_id': "76e5be0eec71b28fb4380b0ac42201cf",
            'client_secret': "d293011a0a17dfc8aa191455af4ab7ba"
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
    },



////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  Defaults and other functions below.                                       //
//  Do all your editing above - config will override defaults so add settings //
//  from below to config above if you want to change them                     //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
    defaults:{
        environment: 'dev',

        // client must have xAuth permission from 3rd party
        tumblr_xauth: true,
        twitter_xauth: true,

        app_group: null,

        offline: false,
        timeout: 20000,
        offline_timeout: 5000,

        upload_count: 0,
        upload_mode: "On",
        upload_paused: false,
        geolocation_enabled: true,

        camplus_options: false,  // show camera-plus options in my-account page

        current_view: null,

        zoom: 15,
        feed_count: 9,
        map_count: 10,
        side_scroll_initial: 6,
        side_scroll_more: 10,
        activity_count: 25,
        share_redirect: "#/uploading/?"
    },
    initialize: function(){
        var update_env = _.bind(function(){
            this.set(this.environments[this.get('environment')]);
            this.set('api_base', this.get('base_url') + "/api");
            this.set('avatar_url', this.get('base_url') + "/avatars");
            this.set('access_token_url', this.get('base_url') + "/ext/oauth/access_token/");
        }, this);
        this.bind('change:environment', update_env);
        this.set(_.extend(this.defaults, this.config));
        update_env();
    }
});

return new config_model();

});
