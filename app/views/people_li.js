/*global _  define require */
define(['backbone', 'auth'], function(Backbone, auth){
return Backbone.View.extend({

    initialize: function(){
        _.bindAll( this);
        this.template = this.options.template;

        this.model.bind( "change", this.refresh );
    },

    tagName: 'li',

    render: function(){
        this.$el
            .html( this.template({
                user: this.model,
                auth_username: auth.get( "snapr_user" ),
                logged_in: auth.has( "access_token" )
            }) );

        return this;
    },

    refresh: function(){
        // unfortunately jquery mobile doesn't like refreshing inividual listview items
        // when the listview has already been created so we need to change things manually

        var follow_button = this.$(".x-follow, .x-unfollow");
        var following = this.model.get("relationship").you_follow;

        if (following){
            follow_button
                .attr("data-icon", "check")
                .removeClass("x-follow")
                .addClass("x-unfollow");

            follow_button.find("span.ui-icon")
                    .removeClass("ui-icon-plus")
                    .addClass("ui-icon-check");
        }else{
            follow_button
                .attr("data-icon", "plus")
                .removeClass("x-unfollow")
                .addClass("x-follow");

            follow_button.find("span.ui-icon")
                    .removeClass("ui-icon-check")
                    .addClass("ui-icon-plus");
        }

        this.$(".followers").text( this.model.get("followers") );
        this.$(".photo-count").text( this.model.get("photo_count") );
    },

    events: {
        "click .x-follow": "follow",
        "click .x-unfollow": "unfollow"
    },

    follow: function(){
        var user = this.model,
            button = this.$('.x-follow');
        button.x_loading();
        auth.require_login( function(){
            user.follow(function(){
                button.x_loading(false);
            });
        })();
    },

    unfollow: function(){
        var user = this.model,
            button = this.$('.x-unfollow');
        button.x_loading();
        auth.require_login( function(){
            user.unfollow(function(){
                button.x_loading(false);
            });
        })();
    }
});
});
