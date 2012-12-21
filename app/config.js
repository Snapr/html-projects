/*global _ $ define */
define(['backbone', '../theme/'+window.theme+'/config', 'utils/local_storage'], function(Backbone, theme_config, local_storage) {
var config_model = Backbone.Model.extend({
    defaults:{
        environment: 'dev',

        language: undefined,
        ignore_language_country: true,

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
        xhr_uploads: !!window.FileReader,

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
        tab_bar_template: 'components/tab_bar',
        photoswipe: true,

        app_sharing_opt_in: false,
        app_sharing_opt_in_message: false,

        show_queue: ['my-snaps'],

        sort_order: 'date_utc',

        privacy_controls: true,
        moderation_controls: true,
        follow_controls: true,

        feed_user_links:'feed',

        services: ['twitter', 'facebook', 'foursquare', 'tumblr', 'appdotnet'],

        map_styles: [],

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
            if(theme_config.environments){
                this.set(theme_config.environments[this.get('environment')]);
            }
            this.set('api_base', this.get('base_url') + "/api");
            this.set('avatar_url', this.get('base_url') + "/avatars");
            this.set('access_token_url', this.get('base_url') + "/ext/oauth/access_token/");
        }, this);
        this.bind('change:environment', update_env);
        this.set(_.extend(this.defaults, theme_config.config));

        var config = this,
            match = window.location.href.match(/#\/.*\?(.*)$/),
            query = match && match[1];
        if(query && query.indexOf('=') > -1) {
            _.each(query.split('&'), function (part) {

                var kv = part.split('='),
                    key = kv[0],
                    value = kv[1];

                if(key == 'language') {
                    if(config.get('ignore_language_country')){
                        value = value.split('-')[0];
                    }
                    local_storage.set('language', value);
                }
            });
        }
        config.set('language', local_storage.get('language'));

        update_env();
    }
});

return new config_model();

});
