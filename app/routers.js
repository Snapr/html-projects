snapr.routers = Backbone.Router.extend({
    routes: {
        "about/": "about",
        "about/?*query_string": "about",
        "snapr-apps/": "snapr_apps",
        "snapr-apps/?*query_string": "snapr_apps",
        "app/": "app",
        "app/?*query_string": "app",
        "login/": "login",
        "login/?*query_string": "login",
        "forgot-password/": "forgot_password",
        "forgot-password/?*query_string": "forgot_password",
        "logout/": "logout",
        "join/": "join_snapr",
        "join/?*query_string": "join_snapr",
        "join-success/": "join_success",
        "join-success/?*query_string": "join_success",
        "upload/": "upload",
        "upload/?*query_string": "upload",
        "uploading/": "uploading",
        "uploading/?*query_string": "uploading",
        "photo-edit/": "share_photo",
        "photo-edit/?*query_string": "share_photo",
        "my-account/": "my_account",
        "my-account/?*query_string": "my_account",
        "find-friends/": "find_friends",
        "find-friends/?*query_string": "find_friends",
        "find-friends-twitter/": "find_friends_twitter",
        "find-friends-twitter/?*query_string": "find_friends_twitter",
        "linked-services/": "linked_services",
        "linked-services/?*query_string": "linked_services",
        "connect/": "connect",
        "connect/?*query_string": "connect",
        "tumblr-xauth/": "tumblr_xauth",
        "tumblr-xauth/?*query_string": "tumblr_xauth",
        "twitter-xauth/": "twitter_xauth",
        "twitter-xauth/?*query_string": "twitter_xauth",
        "cities/": "cities",
        "cities/?*query_string": "cities",
        "limbo/": "limbo",
        "limbo/?*": "limbo",
        "feed/": "feed",
        "feed/?*query_string": "feed",
        "dash/": "dash",
        "dash/?*query_string": "dash",
        "dash-add-person/": "dash_add_person",
        "dash-add-person/?*query_string": "dash_add_person",
        "dash-add-search/": "dash_add_search",
        "dash-add-search/?*query_string": "dash_add_search",
        "activity/": "activity",
        "activity/?*query_string": "activity",
        "map/": "map",
        "map/?*query_string": "map",
        "popular/": "popular",
        "popular/?*query_string": "popular",
        "search/": "search",
        "search/?*query_string": "search",
        "user/profile/": "user_profile",
        "user/profile/?*query_string": "user_profile",
        "user/search/": "user_search",
        "user/search/?*query_string": "user_search",
        "user/followers/": "people_followers",
        "user/followers/?*query_string": "people_followers",
        "user/following/": "people_following",
        "user/following/?*query_string": "people_following",
        "venue/search/": "venues",
        "venue/search/?*query_string": "venues",
        "welcome/": "welcome",
        "welcome/?*query_string": "welcome",
        "?*query_string": "home",
        "*path": "home"
    },

    feed: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.feed({
            query: query,
            el: $("#feed")
        });
    },

    home: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        if(query.new_user){
            Route.navigate( "#", true );  // go here so that back is not new_user
            Route.navigate( "#/welcome/" );
        }else{
            snapr.info.current_view = new snapr.views.home({
                el: $('#home')[0]
            });
        }
    },

    login: function( query_string, back_view )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.login({
            query: query,
            el: $("#login")[0],
            back_view: back_view
        });
    },

    forgot_password: function( query_string, back_view )
      {
          var query = snapr.utils.get_query_params( query_string );
          snapr.info.current_view = new snapr.views.forgot_password({
              query: query,
              el: $("#forgot-password")[0],
              back_view: back_view
          });
      },

    logout: function( query_string )
    {
        snapr.utils.get_query_params( query_string );
        if (snapr.auth)
        {
           snapr.auth.logout();
        }
        else
        {
            snapr.auth = new snapr.models.auth;
        }

        window.location.hash = "";
        if (snapr.utils.get_local_param( "appmode" ))
        {
            pass_data('snapr://logout');
        }
    },

    join_snapr: function( query_string)
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.join_snapr({
            el: $("#join-snapr")[0],
            query: query
        });
    },

    join_success: function( query_string, back_view )
    {
        snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.join_success({
            el: $("#join-success")[0],
            back_view: back_view
        });
    },
    upload: function( query_string )
    {
        snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.upload({
            el: $("#upload")[0]
        });
    },

    uploading: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.uploading({
            el: $("#uploading")[0],
            query: query
        });
    },

    share_photo: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.share_photo({
            el: $("#share-photo")[0],
            query: query
        });
    },

    about: function( query_string, back_view )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.about({
            el: $("#about")[0],
            query: query,
            back_view: back_view
        });
    },
    snapr_apps: function( query_string, back_view )
       {
           var query = snapr.utils.get_query_params( query_string );
           snapr.info.current_view = new snapr.views.snapr_apps({
               el: $("#snapr-apps")[0],
               back_view: back_view
           });
       },

    app: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.app({
           el: $("#app")[0],
           query: query
       });
     },

    activity: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.activity({
            el: $("#activity")[0],
            query: query
        });
    },

    cities: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.cities({
            el: $("#cities")[0],
            query: query
        });
    },

    my_account: function( query_string )
    {
        snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.my_account({
            el: $("#my-account")[0]
        });
    },
    find_friends: function( query_string )
    {
        snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.find_friends({
            el: $("#find-friends")[0]
        });
    },
    find_friends_twitter: function( query_string )
       {
           snapr.utils.get_query_params( query_string );
           snapr.info.current_view = new snapr.views.find_friends_twitter({
               el: $("#find-friends-twitter")[0]
           });
       },

    linked_services: function( query_string, back_view )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.linked_services({
            el: $("#linked-services")[0],
            query: query,
            back_view: back_view
        });
    },

    connect: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.connect({
            el: $("#connect")[0],
            query: query
        });
    },

    tumblr_xauth: function( query_string, back_view )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.tumblr_xauth({
            el: $("#tumblr-xauth")[0],
            query: query,
            back_view: back_view
        });
    },

    twitter_xauth: function( query_string, back_view )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.twitter_xauth({
            el: $("#twitter-xauth")[0],
            query: query,
            back_view: back_view
        });
    },

    limbo: function( query_string )
    {
        snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.limbo({
            el: $("#limbo")[0]
        });
    },

    map: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.map({
            query: query,
            el: $("#map")[0]
        });
    },

    popular: function( query_string )
    {
        snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.popular({
            el: $( "#popular" )[0]
        });
    },

    dash: function( query_string )
    {
        snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.dash({
            el: $( "#dashboard" )[0]
        });
    },

    dash_add_person: function( query_string, back_view )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.dash_add_person({
            el: $("#dash-add-person")[0],
            back_view: back_view
        });
    },

    dash_add_search: function( query_string, back_view )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.dash_add_search({
            el: $("#dash-add-search")[0],
            back_view: back_view
        });
    },

    search: function( query_string, back_view )
    {
        snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.search({
            el: $("#search")[0],
            back_view: back_view
        });
    },

    user_profile: function( query_string, back_view )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.user_profile({
            query: query,
            el: $("#user-profile")[0],
            back_view: back_view
        });
    },

    user_search: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.people({
            query: query,
            el: $("#people")[0]
        });
    },

    people_followers: function( query_string, back_view )
    {
        var query = snapr.utils.get_query_params( query_string, back_view );
        snapr.info.current_view = new snapr.views.people({
            query: query,
            follow: "followers",
            el: $("#people")[0],
            back_view: back_view
        });
    },

    people_following: function( query_string, back_view )
    {
        var query = snapr.utils.get_query_params( query_string, back_view );
        snapr.info.current_view = new snapr.views.people({
            query: query,
            follow: "following",
            el: $("#people")[0],
            back_view: back_view
        });
    },

    venues: function( query_string )
    {
        var query = snapr.utils.get_query_params( query_string );
        snapr.info.current_view = new snapr.views.venues({
            query: query,
            el: $("#venues")[0]
        });
    },
    welcome: function( query_string )
       {
           var query = snapr.utils.get_query_params( query_string );
           snapr.info.current_view = new snapr.views.welcome({
               query: query,
               el: $("#welcome")[0]
           });
       }
});
