({
    appDir: "../",
    baseUrl: "app",
    dir: "../build",
    mainConfigFile: "main.js",
    optimizeCss: "none",
    optimize: "none",
    modules: [
        {
            name: "main",
            include: [
                "views/home",
                "views/join_snapr",
                "views/join_success",
                "views/login",
                "views/welcome",
                "views/forgot_password",
                'views/feed',
                "views/activity",
                "views/upload",
                "views/uploading",
                "views/share_photo",
                "views/about",
                "views/snapr_apps",
                "views/app",
                "views/cities",
                "views/popular",
                "views/my_account",
                "views/find_friends",
                "views/find_friends_linked_services",
                "views/linked_services",
                "views/connect",
                "views/tumblr_xauth",
                "views/twitter_xauth",
                "views/map",
                "views/dash",
                //"views/dash_add_person",
                //"views/dash_add_search",
                "views/search",
                "views/user_profile",
                "views/people",
                "views/venues",
                "views/limbo"
            ]
        }
    ]
})
