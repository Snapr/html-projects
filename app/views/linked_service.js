tripmapper.views.linked_service = Backbone.View.extend({

    tagName: 'div',
    
    // initialize: function()
    // {
    //     console.warn( "initialize linked_service", this );
    // },

    linked_service_template: _.template( $('#linked-service-template').html() ),

    add_service_template: _.template( $('#add-linked-service-template').html() ),

    events: {
        "click .unlink": "unlink_service",
        "click .save": "save_changes",
        
        "click .twitter-import-profile": "twitter_import_profile",
        "change #twitter-link": "twitter_link",
        "change #twitter-tweet": "twitter_tweet",
        
        "change #foursquare-link": "foursquare_link",
        "change #foursquare-checkin": "foursquare_checkin",
        
        "change #facebook-link": "facebook_link",
        "change #facebook-newsfeed": "facebook_newsfeed",
        "change #facebook-gallery": "facebook_gallery"
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
    
    unlink_service: function()
    {
        console.warn( "unlink", this );
    },
    
    save_changes: function()
    {
        console.warn( "save", this.model );
        
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
                console.warn( 'import profile error', e );
            }
        }
        
        this.model.save( {}, options );
    },
    
    twitter_link: function()
    {
        var checked = $(this.el).find("#twitter-link").is(':checked');
        this.model.set({
            show_name: checked
        });
    },
    
    twitter_tweet: function()
    {
        var checked = $(this.el).find('#twitter-tweet').is(':checked');
        this.model.set({
            allow_tweets: checked
        });
    },
    
    foursquare_link: function()
    {
        var checked = $(this.el).find("#foursquare-link").is(':checked');
        this.model.set({
            show_username: checked
        });
    },
    
    foursquare_checkin: function()
    {
        var checked = $(this.el).find('#foursquare-checkin').is(':checked');
        this.model.set({
            allow_checkin: checked
        });
    },
    
    facebook_link: function()
    {
        var checked = $(this.el).find('#facebook-link').is(':checked');
        this.model.set({
            show_profile_link: checked
        });
    },
    
    facebook_newsfeed: function()
    {
        var checked = $(this.el).find('#facebook-newsfeed').is(':checked');
        this.model.set({
            allow_newsfeed_posts: checked
        });
    },
    
    facebook_gallery: function()
    {
        var checked = $(this.el).find('#facebook-gallery').is(':checked');
        this.model.set({
            allow_gallery_posts: checked
        });
    }
    


});