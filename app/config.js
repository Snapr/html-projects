/*global _  define */
define(['backbone'], function(Backbone) {

// lets use a backbone model so we can bind to change events etc
var config_model = Backbone.Model.extend({
    defaults:{
        environment: 'dev',

        // client must have xAuth permission from 3rd party
        tumblr_xauth: false,
        twitter_xauth: false,

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
        side_scroll_initial: 6,
        side_scroll_more: 10,
        share_redirect: "#/feed/"
    },
    environments: {
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
    },
    initialize: function(){
        this.bind('change:environment', function(){
            this.set(this.environments[this.get('environment')]);
            this.set('api_base', this.get('base_url') + "/api");
            this.set('avatar_url', this.get('base_url') + "/avatars");
            this.set('access_token_url', this.get('base_url') + "/ext/oauth/access_token/");
        });
        this.set(this.defaults);
        this.set(this.environments[this.get('environment')]);
    }
});

return new config_model();

});
