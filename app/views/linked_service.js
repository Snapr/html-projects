snapr.views.linked_service = Backbone.View.extend({

    tagName: 'div',

    initialize: function()
    {
        // console.log( "initialize linked_service", this );

        this.linked_service_template = _.template( $('#linked-service-template').html() );

        this.add_service_template = _.template( $('#add-linked-service-template').html() );

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
            $(this.el).empty().append( this.linked_service_template( {service: this.model} ) );
        }
        else
        {
            if (this.provider)
            {
                $(this.el).empty().append( this.add_service_template( {provider:this.provider} ) );
            }
        }

        return this;
    },

    link_service: function()
    {
        if (this.provider == "tumblr")
        {
            $.ajax({
                url: snapr.api_base + '/linked_services/tumblr/',
                type: 'POST',
                dataType: 'jsonp',
                data:{
                    username: $('#tumblr-email').val(),
                    password: $('#tumblr-password').val(),
                    access_token: snapr.auth.get("access_token"),
                    _method: "POST"
                },
                success: function( data )
                {
                    if( data.success )
                    {
                        snapr.info.current_view.initialize();
                    }else{
                        alert( data.error.message );
                    }
                },
                error: function( data )
                {
                    console.log('ajax error!');
                },
            });

        }
        else
        {
            url = snapr.api_base + "/linked_services/"
                + this.provider + "/oauth/?access_token=" + snapr.auth.get("access_token") + "&redirect=" + escape( window.location.href );
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
        console.log( "save", this.model );

        var linked_service = this;

        var options = {
            success: function()
            {
                $(linked_service.el).find("[data-role='collapsible']").trigger('collapse');
            },
            error: function()
            {
                alert( "Sorry, we had trouble saving your settings." )
            }
        }

        if(this.model.provider == 'facebook')
        {
            this.model.set({
                gallery_name: $(this.el).find("#facebook-gallery-name").val()
            })
        }

        if(this.model.provider == 'tumblr')
        {
            this.model.unset('show_username');
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
            show_name: $(this.el).find("#twitter-link").is(':checked')
        });
    },

    twitter_tweet: function()
    {
        this.model.set({
            allow_tweets: $(this.el).find('#twitter-tweet').is(':checked')
        });
    },

    foursquare_link: function()
    {
        this.model.set({
            show_username: $(this.el).find("#foursquare-link").is(':checked')
        });
    },

    foursquare_checkin: function()
    {
        this.model.set({
            allow_checkin: $(this.el).find('#foursquare-checkin').is(':checked')
        });
    },

    facebook_link: function()
    {
        this.model.set({
            show_profile_link: $(this.el).find('#facebook-link').is(':checked')
        });
    },

    facebook_newsfeed: function()
    {
        this.model.set({
            allow_newsfeed_posts: $(this.el).find('#facebook-newsfeed').is(':checked')
        });
    },

    facebook_gallery: function()
    {
        this.model.set({
            allow_gallery_posts: $(this.el).find('#facebook-gallery').is(':checked')
        });
    },

    tumblr_link: function()
    {
        this.model.set({
            show_name: $(this.el).find('#tumblr-link').is(':checked')
        });
    },

    tumblr_post: function()
    {
        this.model.set({
            allow_posts: $(this.el).find('#tumblr-post').is(':checked')
        });
    }



});
