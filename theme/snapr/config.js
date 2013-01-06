/*global _ $ define theme_templates theme_views */
define(function(){
return {
    config: {

        //  Pay attention to trailing commas. Make sure every uncommented
        //  setting has one apart form the the last one.


        //  from theme.environments below
        //  default: 'dev'
        //environment: 'live',

        //  default: undefined
        //app_group: 'my-app',

        //  "home page"
        //  default: 'home'
        initial_view: 'dash',


        //  Language

            //  default language
            //  default: undefined (no translation - english)
            //language: 'fr',

            //  should 'en-US' be treated as 'en'?
            //  default: true
            //ignore_language_country: false,


        //  Linked Services

            //  services this app uses
            //  default: all 5
            services: ['twitter', 'facebook', 'foursquare', 'tumblr', 'appdotnet'],

            //  use xauth flow
            //  client must have xAuth permission from 3rd party
            //  default true
            //twitter_xauth: false,
            //tumblr_xauth: false,

            //  defaut settings for tumblr_posts view
            //default_tumblr_host: 'snaprtest.tumblr.com',
            //tumblr_key: '0i9zD5xabR9QlY0BWhFV2XiRr1wI329fPlH4S5kPuvuBWkRQUb',

            //  No. tumblr posts to show on dash
            //  default: 3
            dash_tumblr_posts: 1,

            //  signin with facebook should create users rather than autofill join form
            //  default: false
            autocreate_fb_users: true


        //  Geolocation

            //  should we ever try to get a location
            //  default: true
            //geolocation_enabled: false,

            //  time before asking native for a new location (ms)
            //  default: 5 mins
            //geolocation_cache_life: 1000*60*10,


        //  how to display special case usernames
        //  defaults: 'anon', 'me'
        //anon_username: 'anonymous',
        //me_username: 'you',


        //  Tab bar

            //  defaut: true
            //show_tab_bar: false,
            //  default: 'components/tab_bar'
            //tab_bar_template: theme_templates_path + 'components/tab_bar',


        //  app_sharing_opt_in

            //  if true share screen will give option to share with app
            //  if uses chooses not to share photo will be 'public_non_app' status
            //  default: false
            //app_sharing_opt_in: true,

            //  show a message explaining app_sharing_opt_in on share screen
            //  in place of share text entry area
            //  default: false
            //app_sharing_opt_in_message: true,"

        //  list of feed views to show upload queue in
        //  dafault: 'my-snaps' only
        //  valid: 'feed', 'my-snaps'
        //show_queue: ['my-snaps'],

        //  dafault sort order for all lists of photos
        //  default: date_utc the photo was taken.
        //  valid: rating, favorite_count, comment_count, date_local, date_added, date_utc, score, weighted_score
        //sort_order: 'date_added',

        //  controls to show in feed view
        //  defaults: both true
        //  show public/private for your own images
        //privacy_controls: false,
        //  show 'flag inappropriate' for others images
        //moderation_controls: false,

        //  show follow buttons for other users
        //  default: true
        //follow_controls: false,

        //  where should usenames in feed view link to
        //  default: 'feed'
        //  valid: 'feed', 'profile'
        //feed_user_links: 'profile',

        //  should clicking a photo in feed show a gallery view (photoswipe plugin)
        //  default: true
        //photoswipe: false,


        //  Map

            //  Extra styles for map as per https://developers.google.com/maps/documentation/javascript/reference#MapTypeStyle
            //  wizzard:  http://gmaps-samples-v3.googlecode.com/svn/trunk/styledmaps/wizard/index.html
            //  eg: map_styles: [
            //      {
            //         "stylers": [
            //             { "hue": "#ffc300" },
            //             { "lightness": 34 }
            //         ]
            //      }
            //  ],
            //map_styles: [],

            //  Number of photos/spots to show on map
            //  defaults: 10
            //map_thumb_count: 5,
            //map_spot_count: 5,

            //  default zoom for map
            //  default: 15
            //zoom: 12,


        //  minimum rating photos must have to show
        //  default: undefined (no min)
        //min_photo_rating: 3,


        //  request points when getting users form the api
        //  useful if points are displayed with user details
        //  default: false
        //get_user_points: true,

        //  timeout, ms, max api response time allowed
        //  default: 20 sec
        //timeout: 1000*10,
        //  offline_timeout, ms, max api response time allowed when in offline mode
        //  default: 5 sec
        //offline_timeout: 1000*2,

        //  number of images to show in feed views
        //  default: 9
        //feed_count: 5,

        //  numbers of images to show in side-scrollers initially
        //  default: 6
        //side_scroll_initial: 3,

        //  number of extra images to load into side-scrollers when "load more" is activated
        //  default: 10
        //side_scroll_more: 6,

        //  how many items to load in activity page
        //  default: 25
        //activity_count: 10,

        //  how many meters is 'nearby'
        //  default: 5000
        //nearby_radius: 10000,

        //  show camera-plus options in my-account page
        //  default: false
        //camplus_options: true

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
