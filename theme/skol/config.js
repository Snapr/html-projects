/*global _ $ define theme_templates_path theme_views_path */
// include analytics to initialise it
define(['./analytics'], function(analytics){
return {
    config: {
        // analytics: included above

        environment: 'dev',  // from theme.environments below

        //language: 'leet',
        //ignore_language_country: false,

        // sort_order: 'date_added',  // defaults to date_utc the photo was taken. (rating, favorite_count, comment_count, date_local, date_added, date_utc, score, weighted_score)

        // initial_view: 'dash',  // "home page"
        show_tab_bar: false,

        app_group: 'ibeats',

        min_photo_rating: 0,

        // client must have xAuth permission from 3rd party
        tumblr_xauth: true,
        twitter_xauth: true,

        app_sharing_opt_in: true,
        app_sharing_opt_in_messaqge: 'Toggle the Skol sharing button to submit your photo to be featured in this app and on Skol&rsquo;s websites. You can also share to Facebook, Twitter &amp; Foursquare.',

        privacy_controls: false,
        moderation_controls: true,
        follow_controls: false,
        photoswipe: false,

        show_queue: ['feed'],

        feed_user_links:'profile',

        services: ['twitter', 'facebook', 'foursquare', 'appdotnet'],

        //default_tumblr_host: 'snaprtest.tumblr.com',
        //tumblr_key: '0i9zD5xabR9QlY0BWhFV2XiRr1wI329fPlH4S5kPuvuBWkRQUb',

        // how to display special case usernames
        anon_username: 'anon',
        me_username: 'me',

        map_styles: [
            {
                "stylers": [
                      { "hue": "#ffc300" },
                      { "invert_lightness": true },
                      { "lightness": 34 },
                      { "saturation": 74 }
                ]
            }
        ],

        autocreate_fb_users: true  // signin with facebook should create users rather than autofill join form
        //get_user_points: false,  // request points when getting users form the api
        //timeout: 1000*20,  // ms, max api response time allowed
        //offline_timeout: 1000*5,  // ms, max api response time allowed when in offline mode
        //geolocation_cache_life: 1000*60*5,  // ms, max age of geoloactions from device
        //zoom: 15, // default for map
        //feed_count: 9, // number of images to show in feed views
        //map_count: 10, // number of images to show on the map
        //dash_tumblr_posts: 3,
        //side_scroll_initial: 6, // numbers of images to show in side-scrollers initially
        //side_scroll_more: 10, // number of extra images to load into side-scrollers when "load more" is activated
        //activity_count: 25,  // how many items to load in activity page
        //nearby_radius: 5000,  // how many meters is 'nearby'
        //share_redirect: "#/uploading/?"  // set to hash url to redirect after successful upload/share.
        //camplus_options: false  // show camera-plus options in my-account page
    },

    environments: {
        dev: {
            base_url: "http://dev.sna.pr",
            client_id:"d837d7b7666cd155deae78c65238e47f",
            client_secret:"60b07d45406ef346fdbc3aa6a5150b62"
        },
        live: {
            base_url: "https://sna.pr",
            client_id:"b998b5de51c36c592b35582f623d6397",
            client_secret:"14fe32c822ab38777a69c2d30416a2c1"
        },
        local: {
            base_url: "http://localhost:8000",
            client_id: "client",
            client_secret: "secret"
        }
    },

    pages: [
        {
            name: 'age-block',
            view: 'base/page',
            template: theme_templates_path + 'age-block'
        },
        {
            name: 'home',
            template: theme_templates_path + 'home',
            view: theme_views_path + 'home'
        },
        {
            name: 'about',
            template: theme_templates_path + 'about'
        },
        'map',
        'app',
        {
            name: 'login',
            template: theme_templates_path + 'login'
        },
        'logout',
        'upload',
        'uploading',
        'connect',
        'cities',
        'limbo',
        {
            name: 'feed',
            template: theme_templates_path + 'feed'
        },
        'dash',
        {
            name: 'feeds',
            view: 'dash',
            extra: {show: ['user-streams', 'featured-streams']}
        },
        'leaderboard',
        'activity',
        'popular',
        'search',
        {
            name: 'spots',
            template: theme_templates_path + 'spots'
        },
        {
            name: 'spot',
            template: theme_templates_path + 'spot'
        },
        {
            name: 'welcome',
            template: theme_templates_path + 'welcome'
        },
        'snapr-apps',
        'forgot-password',
        {
            name: 'join',
            template: theme_templates_path + 'join'
        },
        {
            name: 'join-success',
            template: theme_templates_path + 'join_success'
        },
        'my-account',
        'linked-services',
        'tumblr-posts',
        'tumblr-xauth',
        'twitter-xauth',
        {
            name: 'share',
            template: 'share',
            view: theme_views_path + 'share'
        },
        {
            name: 'user/followers',
            view: 'people',
            extra: {follow: "followers"}
        },
        {
            name: 'user/following',
            view: 'people',
            extra: {follow: "following"}
        },
        {
            name: 'user/search',
            view: 'people'
        },
        'user/profile',
        {
            name: 'upload_xhr',
            template: 'upload'
        },
        'foursquare_venues',
        'competitions',
        'competition'
    ]
};
});
