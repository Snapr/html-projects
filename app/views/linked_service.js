/*global _  define require */
define(['config', 'backbone', 'utils/link_service', 'auth', 'utils/alerts'], function(config, Backbone, link_service, auth, alerts){
return Backbone.View.extend({

    tagName: 'li',

    initialize: function(){
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

    render: function(){
        if (this.model){
            this.$el.html( this.linked_service_template( {service: this.model} ) );
        }else{
            if (this.provider){
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
        var next = this.get_return_url();

        $.mobile.showPageLoadingMsg();

        link_service(this.provider, next);
    },

    unlink_service: function(){
        var options = {
            success: function(){
                var parent = config.get('current_view');
                parent.user_settings.cache_bust();
                parent.fetch();
            },
            error: function(){
                alerts.notification('Error', 'Sorry, we had trouble unlinking your account');
            }
        };

        // set the id to a non-null value so that backbone doesn't think it is new and abort
        this.model.id = false;
        this.model.destroy( options );
    },

    save_changes: function(){
        var linked_service = this;

        var options = {
            success: function(model, response){
                if(!response.success){
                    alerts.notification('Error', "Sorry, we had trouble saving your settings." );
                    linked_service.my_account.initialize();
                }
                //linked_service.$el.find("[data-role='collapsible']").trigger('collapse');
            },
            error: function(){
                alerts.notification('Error', "Sorry, we had trouble saving your settings." );
                linked_service.my_account.initialize();
            }
        };

        if(this.model.provider == 'facebook'){
            this.model.set({
                gallery_name: this.$el.find("#facebook-gallery-name").val()
            });
        }

        if(this.model.provider == 'tumblr'){
            this.model.unset('username');
            this.model.unset('allow_post');
        }

        this.model.save( {}, options );
    },

    twitter_import_profile: function(){

        var linked_service = this;
        $.ajax({
            url: config.get('api_base') + '/linked_services/twitter/import_profile/',
            data: {
                access_token: auth.get('access_token'),
                _method: 'POST'
            },
            dataType: 'jsonp',
            success: function(response){
                alerts.notification('Success', "Profile imported.");
            },
            error: function(e){
                console.error( 'import profile error', e );
            }
        });
    },

    twitter_link: function(){
        this.model.set({
            show_username: this.$el.find("#twitter-link").val()
        });
        this.save_changes();
    },

    twitter_tweet: function(){
        this.model.set({
            allow_tweets: this.$el.find('#twitter-tweet').val()
        });
        this.save_changes();
    },

    foursquare_link: function(){
        this.model.set({
            show_username: this.$el.find("#foursquare-link").val()
        });
        this.save_changes();
    },

    foursquare_checkin: function(){
        this.model.set({
            allow_checkin: this.$el.find('#foursquare-checkin').val()
        });
        this.save_changes();
    },

    facebook_link: function(){
        this.model.set({
            show_profile_link: this.$el.find('#facebook-link').val()
        });
        this.save_changes();
    },

    facebook_newsfeed: function(){
        this.model.set({
            allow_newsfeed_posts: this.$el.find('#facebook-newsfeed').val()
        });
        this.save_changes();
    },

    facebook_gallery: function(){
        this.model.set({
            allow_gallery_posts: this.$el.find('#facebook-gallery').val()
        });
        this.save_changes();
    },

    tumblr_link: function(){
        this.model.set({
            show_username: this.$el.find('#tumblr-link').val()
        });
        this.save_changes();
    },

    tumblr_post: function(){
        this.model.set({
            allow_posts: this.$el.find('#tumblr-post').val()
        });
        this.save_changes();
    }
});
});
