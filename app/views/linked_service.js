snapr.views.linked_service = Backbone.View.extend({

    tagName: 'li',

    initialize: function()
    {
        this.linked_service_template = _.template( $('#linked-service-template').html() );

        this.add_service_template = _.template( $('#add-linked-service-template').html() );

        // if(this.model){
        //     console.log('binding');
        //     this.model.bind( "change", this.render, this);
        // }
    },

    events: {
        "click .link-service" : "link_service",
        "click .unlink": "unlink_service",
        "click .save": "save_changes",

        "submit .tumblr-form": "link_service",

        "click .twitter-import-profile": "twitter_import_profile",
        "change #twitter-link": "twitter_link",
        "change #twitter-tweet": "twitter_tweet",

        "change #foursquare-link": "foursquare_link",
        "change #foursquare-checkin": "foursquare_checkin",

        "change #facebook-link": "facebook_link",
        "change #facebook-newsfeed": "facebook_newsfeed",
        "change #facebook-gallery": "facebook_gallery",

        "change #tumblr-link": "tumblr_link",
        "change #tumblr-post": "tumblr_post"
    },

    render: function()
    {
        if (this.model)
        {
            this.$el.html( this.linked_service_template( {service: this.model} ) );
        }
        else
        {
            if (this.provider)
            {
                this.$el.html( this.add_service_template( {provider:this.provider} ) );
            }
        }

        return this;
    },

    // can be overriden when extending this view
    get_return_url: function(){
        return window.location.href;
    },

    link_service: function(){
        var url,
            next = this.get_return_url();

        $.mobile.showPageLoadingMsg();

        if (this.provider == 'twitter' && snapr.twitter_xauth){
            url = '#/twitter-xauth/?redirect='+ escape( next );
            Route.navigate( url );
        }else if (this.provider == 'tumblr' && snapr.tumblr_xauth){
            url = '#/tumblr-xauth/?redirect='+ escape( next );
            Route.navigate( url );
        }else{
            if (snapr.utils.get_local_param( "appmode" ))
            {
                if (snapr.utils.get_local_param("appmode") == 'iphone')
                {
                    // double encode for iphone - the iOS code should be changed to handle it
                    // without this so this can be removed in future

                    url = snapr.api_base + "/linked_services/"+ provider +
                        "/oauth/?display=touch&access_token=" + snapr.auth.get("access_token") +
                        "&double_encode=true&redirect=" + escape("snapr://redirect?url=" + escape( next ));
                }
                else if(snapr.utils.get_local_param("appmode") == 'android')
                {
                     // android needs a snapr://link?url=
                        url = "snapr://link?url=" + snapr.api_base +
                            "/linked_services/"+ this.provider + "/oauth/?display=touch&access_token=" +
                            snapr.auth.get("access_token") + "&redirect=snapr://redirect?url=" +
                            escape( next );
                }
                else
                {
                    // non-ios builds should be made to handle the redirect param escaped property so
                    // this can be changed to escape("snapr://redirect?url=" + escape( window.location.href ))
                    url = snapr.api_base + "/linked_services/"+ this.provider + "/oauth/?display=touch&access_token=" +
                        snapr.auth.get("access_token") +
                        "&redirect=snapr://redirect?url=" + escape( next );
                }
            }
            else
            {
                url = snapr.api_base + "/linked_services/" + this.provider +
                    "/oauth/?display=touch&access_token=" + snapr.auth.get("access_token") +
                    "&redirect=" + escape( next );
            }
            window.location = url;
        }
    },

    unlink_service: function()
    {
        var options = {
            success: function()
            {
                snapr.info.current_view.initialize();
                console.log('unlink success');
            },
            error: function()
            {
                alert('Sorry, we had trouble unlinking your account');
            }
        }

        // set the id to a non-null value so that backbone doesn't think it is new and abort
        this.model.id = false;
        this.model.destroy( options );
    },

    save_changes: function()
    {
        var linked_service = this;

        var options = {
            success: function(response)
            {
                if(!response.success){
                    //linked_service.model.fetch();
                }
                //linked_service.$el.find("[data-role='collapsible']").trigger('collapse');
            },
            error: function()
            {
                linked_service.model.fetch();
                alert( "Sorry, we had trouble saving your settings." );
            }
        }

        if(this.model.provider == 'facebook')
        {
            this.model.set({
                gallery_name: this.$el.find("#facebook-gallery-name").val()
            })
        }

        if(this.model.provider == 'tumblr')
        {
            //this.model.unset('username');
            this.model.unset('allow_post');
        }

        this.model.save( {}, options );
    },

    twitter_import_profile: function()
    {
        // set the data to be posted here since it's not part of the model
        this.model.data = {
            import_profile: true
        }

        var linked_service = this;

        var options = {
            success: function()
            {
                // remove the additional post data set above
                delete linked_service.model.data;
                alert( "Profile imported.");
            },
            error: function(e)
            {
                console.log( 'import profile error', e );
            }
        }

        this.model.save( {}, options );
    },

    twitter_link: function()
    {
        this.model.set({
            show_username: this.$el.find("#twitter-link").val()
        });
        this.save_changes();
    },

    twitter_tweet: function()
    {
        this.model.set({
            allow_tweets: this.$el.find('#twitter-tweet').val()
        });
        this.save_changes();
    },

    foursquare_link: function()
    {
        this.model.set({
            show_username: this.$el.find("#foursquare-link").val()
        });
        this.save_changes();
    },

    foursquare_checkin: function()
    {
        this.model.set({
            allow_checkin: this.$el.find('#foursquare-checkin').val()
        });
        this.save_changes();
    },

    facebook_link: function()
    {
        this.model.set({
            show_profile_link: this.$el.find('#facebook-link').val()
        });
        this.save_changes();
    },

    facebook_newsfeed: function()
    {
        this.model.set({
            allow_newsfeed_posts: this.$el.find('#facebook-newsfeed').val()
        });
        this.save_changes();
    },

    facebook_gallery: function()
    {
        this.model.set({
            allow_gallery_posts: this.$el.find('#facebook-gallery').val()
        });
        this.save_changes();
    },

    tumblr_link: function()
    {
        this.model.set({
            show_username: this.$el.find('#tumblr-link').val()
        });
        this.save_changes();
    },

    tumblr_post: function()
    {
        this.model.set({
            allow_posts: this.$el.find('#tumblr-post').val()
        });
        this.save_changes();
    }
});
