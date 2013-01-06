/*global _ $ define theme_templates theme_views */
define(function(){
return {
    config: {
        environment: 'dev',  // from theme.environments below

        //language: 'leet',

        sort_order: 'date_utc',  // defaults to date_utc the photo was taken. (rating, favorite_count, comment_count, date_local, date_added, date_utc, score, weighted_score)

        initial_view: 'dash',  // "home page"
        show_tab_bar: true,

        app_group: 'snapr',

        // client must have xAuth permission from 3rd party
        tumblr_xauth: true,
        twitter_xauth: true,

        default_tumblr_host: 'snaprtest.tumblr.com',
        tumblr_key: '0i9zD5xabR9QlY0BWhFV2XiRr1wI329fPlH4S5kPuvuBWkRQUb',

        // how to display special case usernames
        anon_username: 'anon',
        me_username: 'me',

        autocreate_fb_users: true, // signin with facebook should create users rather than autofill join form

        //get_user_points: false,  // request points when getting users form the api
        //timeout: 1000*20,  // ms, max api response time allowed
        //offline_timeout: 1000*5,  // ms, max api response time allowed when in offline mode
        //geolocation_cache_life: 1000*60*5,  // ms, max age of geoloactions from device
        //zoom: 15, // default for map
        //feed_count: 9, // number of images to show in feed views
        //map_count: 10, // number of images to show on the map
        dash_tumblr_posts: 1,
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
            client_id: "76e5be0eec71b28fb4380b0ac42201cf",
            client_secret: "d293011a0a17dfc8aa191455af4ab7ba"
        },
        live: {
            base_url: "https://sna.pr",
            client_id: "76e5be0eec71b28fb4380b0ac42201cf",
            client_secret: "d293011a0a17dfc8aa191455af4ab7ba"
        },
        local: {
            base_url: "http://localhost:8000",
            client_id: "client",
            client_secret: "secret"
        }
    },

    pages: [
        'home',
        'cities',
        'feed',
        'dash',
        {
            name: 'feeds',
            view: 'dash',
            extra: {show: ['user-streams', 'featured-streams']}
        },
        'leaderboard',
        'activity',
        'popular'
    ]
};
});
