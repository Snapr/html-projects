/*global _ $ define */
define(['backbone', '../theme/'+window.theme+'/config'], function(Backbone, theme_config) {
var config_model = Backbone.Model.extend({
    defaults:{
        environment: 'dev',

        initial_view: 'home',

        // client must have xAuth permission from 3rd party
        tumblr_xauth: true,
        twitter_xauth: true,

        app_group: null,

        offline: false,
        timeout: 20000,
        offline_timeout: 5000,

        upload_mode: "On",
        upload_paused: false,
        geolocation_enabled: true,
        geolocation_cache_life: 1000*60*5,

        get_user_points: false,

        autocreate_fb_users: false,

        camplus_options: false,  // show camera-plus options in my-account page

        current_view: null,

        default_tumblr_host: 'snaprtest.tumblr.com',
        tumblr_key: '0i9zD5xabR9QlY0BWhFV2XiRr1wI329fPlH4S5kPuvuBWkRQUb',

        anon_username: 'anon',
        me_username: 'me',

        show_tab_bar: true,

        sort_order: 'date_utc',

        //min_photo_rating: ,  not defind if non needed
        zoom: 15,
        feed_count: 9,
        map_thumb_count: 10,
        map_spot_count: 10,
        dash_tumblr_posts: 3,
        side_scroll_initial: 6,
        side_scroll_more: 10,
        activity_count: 25,
        nearby_radius: 5000,
        share_redirect: "#/uploading/?"
    },
    initialize: function(){
        var update_env = _.bind(function(){
            this.set(theme_config.environments[this.get('environment')]);
            this.set('api_base', this.get('base_url') + "/api");
            this.set('avatar_url', this.get('base_url') + "/avatars");
            this.set('access_token_url', this.get('base_url') + "/ext/oauth/access_token/");
        }, this);
        this.bind('change:environment', update_env);
        this.set(_.extend(this.defaults, theme_config.config));
        update_env();
    }
});

return new config_model();

});
