/*global _  define require */
define(['config', 'views/base/view', 'utils/link_service', 'auth', 'utils/alerts', 'utils/query'], function(config, view, link_service, auth, alerts, Query){
return view.extend({

    tagName: 'li',

    initialize: function(){

        this.linked_service_template = this.get_template('components/linked_services/linked');
        this.unlinked_service_template = this.get_template('components/linked_services/unlinked');
    },

    events: {
        "click .x-link" : "link_service",
        "click .x-unlink": "unlink_service",
        "click .x-save": "save_changes",

        "submit .x-tumblr-form": "link_service",

        "click .x-twitter-import-profile": "twitter_import_profile",
        "change .x-twitter-link": "twitter_link",
        "change .x-twitter-tweet": "twitter_tweet",

        "change .x-foursquare-link": "foursquare_link",
        "change .x-foursquare-checkin": "foursquare_checkin",

        "change .x-facebook-link": "facebook_link",
        "change .x-facebook-newsfeed": "facebook_newsfeed",
        "change .x-facebook-gallery": "facebook_gallery",

        "change .x-tumblr-link": "tumblr_link",
        "change .x-tumblr-post": "tumblr_post"
    },

    render: function(){
        if (this.model){
            this.$el.html( this.linked_service_template( {service: this.model} ) );
        }else{
            if (this.provider){
                this.$el.html( this.unlinked_service_template( {provider:this.provider} ) );
            }
        }

        return this;
    },

    // can be overriden when extending this view
    get_return_url: function(){
        var split = window.location.href.split('?'),
            path = split[0],
            query = new Query(split[1]);
            query.remove('url').remove('username').remove('id');
            return path + '?' + query.toString();
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
                //linked_service.$("[data-role='collapsible']").trigger('collapse');
            },
            error: function(){
                alerts.notification('Error', "Sorry, we had trouble saving your settings." );
                linked_service.my_account.initialize();
            }
        };

        if(this.model.provider == 'facebook'){
            this.model.set({
                gallery_name: this.$(".x-facebook-gallery-name").val()
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
            show_username: this.$(".x-twitter-link").val()
        });
        this.save_changes();
    },

    twitter_tweet: function(){
        this.model.set({
            allow_tweets: this.$('.x-twitter-tweet').val()
        });
        this.save_changes();
    },

    foursquare_link: function(){
        this.model.set({
            show_username: this.$(".x-foursquare-link").val()
        });
        this.save_changes();
    },

    foursquare_checkin: function(){
        this.model.set({
            allow_checkin: this.$('.x-foursquare-checkin').val()
        });
        this.save_changes();
    },

    facebook_link: function(){
        this.model.set({
            show_profile_link: this.$('.x-facebook-link').val()
        });
        this.save_changes();
    },

    facebook_newsfeed: function(){
        this.model.set({
            allow_newsfeed_posts: this.$('.x-facebook-newsfeed').val()
        });
        this.save_changes();
    },

    facebook_gallery: function(){
        this.model.set({
            allow_gallery_posts: this.$('.x-facebook-gallery').val()
        });
        this.save_changes();
    },

    tumblr_link: function(){
        this.model.set({
            show_username: this.$('.x-tumblr-link').val()
        });
        this.save_changes();
    },

    tumblr_post: function(){
        this.model.set({
            allow_posts: this.$('.x-tumblr-post').val()
        });
        this.save_changes();
    }
});
});
