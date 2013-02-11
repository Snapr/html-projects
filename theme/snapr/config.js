/*global _ $ define theme_templates theme_views */
define(function(){
return {
    config: {

        //!--  Pay attention to trailing commas. Make sure every uncommented
        //!--  setting has one apart form the the last one.


        //  from theme.environments below
        //  default: 'dev'
        //environment: 'live',


        // ################################
        // CONFIG
        // ################################

        //!--  default: undefined
        app_group: 'snapr',

        //!--  dafault sort order for all lists of photos
        //!--  default: date_utc the photo was taken.
        //!--  valid: rating, favorite_count, comment_count, date_local, date_added, date_utc, score, weighted_score
        //sort_order: 'date_added',

        //!--  minimum rating photos must have to show
        //!--  default: undefined (no min)
        //min_photo_rating: 3,


        // ################################
        // NAVIGATION
        // ################################
        //!-- The base view for the app
        //!--  default: 'home'
        initial_view: 'feed',


        // ################################
        // TAB BAR
        // ################################
        //!-- Show tab bar for nav (alternative is home menu style nav)
        //!--  defaut: true
        //show_tab_bar: false,

        //!-- Override the app tab bar with a custom template
        //!--default: 'components/tab_bar'
        tab_bar_template: theme_templates_path + 'tab_bar',


        // ################################
        // SHARING
        // ################################

        //!--  Set the third party services the app share to
        //!-- options - ['twitter', 'tumblr','facebook', 'foursquare', 'appdotnet']
        //!-- Note that appdotnet support is not yet complete
        //!--  default: all
        services: ['twitter', 'tumblr','facebook', 'foursquare'],

        //!--  any photos share with the app must have a 4sq venue/snapr spot
        //!--  default: false
        //app_photos_must_have_venue: true,

        //!-- Opt in to share photos in app
        //!--  if true share screen will give option to share with app
        //!--  if uses chooses not to share photo will be 'public_non_app' status
        //!--  These photos dont show up in the app or in your moderation system, but can be displayed via a direct link from FB etc
        //  default: false
        //app_sharing_opt_in: true,

        //!--  show a message explaining app_sharing_opt_in on share screen
        //!--  in place of share text entry area
        //!--  default: "Select the tick to enable sharing to this app and its sites. You can also share to Facebook, Twitter, and more"
        //app_sharing_opt_in_message: "Select the tick to enable sharing to this app and its sites. You can also share to Facebook, Twitter, and more",


        // ################################
        // SIGN IN & LINKING
        // ################################

        //!--  signin with facebook should create users rather than autofill join form
        //!--  default: false
        autocreate_fb_users: true,

        //!--  hwhat to do if a persons display username is blank
        //!--  defaults: 'anon', 'me'
        //anon_username: 'anonymous',
        //me_username: 'you',

        //!--  use xauth flow
        //!--  if using custom client details (server side setting) you must make sure these
        //!--  have xAuth permission from the 3rd party
        //!--  default true
        //twitter_xauth: false,
        //tumblr_xauth: false,


        // ################################
        // GEOLOCATION
        // ################################

        //!--  should we ever try to get a location
        //!--  default: true
        //geolocation_enabled: false,

        //!--  time before asking native for a new location (ms)
        //!--  default: 5 mins
        //geolocation_cache_life: 1000*60*10,

        //!--  how many meters is 'nearby'
        //!--  default: 5000
        //nearby_radius: 10000,


        // ################################
        // APP BLOG
        // ################################

        //!-- Does your app have a custom web URL as opposed to a default like apps.sna.pr/myapp/ ?
        //!-- Set your URL base here and links to photos and users in your app will be correctly linked to app content when posted to your blog
        web_link_base: 'sna.pr',

        //!--  defaut blog for tumblr_posts view to show if none is passed via query string
        //default_tumblr_host: 'snaprtest.tumblr.com',
        //tumblr_key: '0i9zD5xabR9QlY0BWhFV2XiRr1wI329fPlH4S5kPuvuBWkRQUb',


        // ################################
        // DASHBOARD
        // ################################

        //!--  No. tumblr posts to show on dash
        //!--  default: 3
        dash_tumblr_posts: 1,


        // ################################
        // IMAGE STREAMS
        // ################################

        //!--  numbers of images to show in side-scrollers initially
        //!--  default: 6
        //side_scroll_initial: 3,

        //!--  number of extra images to load into side-scrollers when "load more" is activated
        //!--  default: 10
        //side_scroll_more: 6,


        // ################################
        // FEED
        // ################################

        //!--
        dropdown_menu_options: [
        {
            url: "#/feed/?sort=weighted_score",
            icon: "person",
            label: "Following"
        },
        {
            url: "#/feed/",
            icon: "person",
            label: "TEST"
        },
        {
            url: "#/feed/?rating=2",
            icon: "photos",
            label: "Featured"
        },
        {
            url: "#/tumblr-posts/?host=snaprapps.tumblr.com",
            icon: "blog",
            label: "Blog"
        }
        ]

        //!--  controls to show in feed view
        //!--  defaults: both true
        //!--  show public/private for your own images
        //privacy_controls: false,

        //!--  show 'flag inappropriate' for others images
        //moderation_controls: false,

        //!-- show follow buttons for other users
        //!--  default: true
        //follow_controls: false,

        //!--  where should usenames in feed view link to
        //!--  default: 'feed'
        //!--  valid: 'feed', 'profile'
        //feed_user_links: 'profile',

        //!--  should clicking a photo in feed show a gallery view (photoswipe plugin)
        //!--  default: true
        //photoswipe: false,

        //!--  number of images to show in feed views
        //default: 9
        //feed_count: 5,


        // ################################
        // MAP
        // ################################

        //!--  Extra styles for map as per https://developers.google.com/maps/documentation/javascript/reference#MapTypeStyle
        //!--  wizzard:  http://gmaps-samples-v3.googlecode.com/svn/trunk/styledmaps/wizard/index.html
        //!--  eg: map_styles: [
        //!--      {
        //!--         "stylers": [
        //!--             { "hue": "#ffc300" },
        //!--             { "lightness": 34 }
        //!--         ]
        //!--      }
        //!--  ],
        //map_styles: [],

        //!--  Number of photos/spots to show on map
        //!--  defaults: 10
        //map_thumb_count: 5,
        //map_spot_count: 5,

        //!--  default zoom for map
        //!--  default: 15
        //zoom: 12,


        // ################################
        // UPLOADING
        // ################################

        //!--  when not in appmode, use xhr for uplaods
        //!--  default: true if browser is capable
        //xhr_uploads: false

        //!--  list of feed views to show upload queue in
        //!--  dafault: 'my-snaps' only
        //!--  valid: 'feed', 'my-snaps'
        //show_queue: ['my-snaps'],


        // ################################
        // ACTIVITY
        // ################################

        //!--  how many items to load in activity page
        //!--  default: 25
        //activity_count: 10,


        // ################################
        // POINTS
        // ################################

        //!--  request points when getting users from the api
        //!--  useful if points are displayed with user details
        //!--  default: false
        //get_user_points: true,


        // ################################
        // TIMEOUTS
        // ################################

        //!--  timeout, ms, max api response time allowed
        //!--  default: 20 sec
        //timeout: 1000*10,
        //!--  offline_timeout, ms, max api response time allowed when in offline mode
        //!--  default: 5 sec
        //offline_timeout: 1000*2,


        // ################################
        // LANGUAGE
        // ################################

        //!-- default language
        //!-- default: undefined (no translation - english)

        // language: 'fr',

        //!-- should 'en-US' be treated as 'en'?
        //!-- default: true
        //  ignore_language_country: false,
    },

    environments: {
        dev: {
            base_url: "http://dev.sna.pr",
            client_id: "76e5be0eec71b28fb4380b0ac42201cf"
        },
        live: {
            base_url: "https://sna.pr",
            client_id: "76e5be0eec71b28fb4380b0ac42201cf"
        },
        local: {
            base_url: "http://localhost:8000",
            client_id: "client"
        }
    },

    pages: [
        'home',
        'feed',
        {
            name: 'dash',
            view: 'dash',
            template: theme_templates_path + 'dash'
        },
        {
            name: 'about',
            view: 'base/page',
            template: theme_templates_path + 'about'
        },
        {
            name: 'join-success',
            view: 'base/page',
            template: theme_templates_path + 'join_success'
        },
        {
            name: 'welcome',
            view: 'welcome',
            template: theme_templates_path + 'welcome'
        },
        'activity',
        'popular'
    ]
};
});
