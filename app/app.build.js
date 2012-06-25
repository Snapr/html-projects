({
    appDir: "../",
    baseUrl: "app",
    dir: "../build",
    mainConfigFile: "main.js",
    optimizeCss: "none",
    //optimize: "none",
    modules: [
        {
            name: "main",
            include: [
                "views/home",
                "views/join",
                "views/join_success",
                "views/login",
                "views/welcome",
                "views/forgot_password",
                'views/feed',
                "views/activity",
                "views/upload",
                "views/uploading",
                "views/share",
                "views/about",
                "views/snapr_apps",
                "views/app",
                "views/cities",
                "views/popular",
                "views/my_account",
                "views/find_friends",
                "views/find_friends_list",
                "views/linked_services",
                "views/connect",
                "views/tumblr_xauth",
                "views/twitter_xauth",
                "views/map",
                "views/dash",
                "views/search",
                "views/spots",
                "views/spot",
                "views/user_profile",
                "views/people",
                "views/venues",
                "views/limbo"
            ]
        }
    ]
})
