snapr.views.people_li = Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this);
        this.template = this.options.template;

        var people_li = this;

        this.model.bind( "change", this.refresh );
    },

    tagName: 'li',

    render: function()
    {
        this.$el
            .html( this.template({
                user: this.model,
                auth_username: snapr.auth.get( "snapr_user" ),
                logged_in: snapr.auth.has( "access_token" )
            }) );

        return this;
    },

    refresh: function()
    {
        // unfortunately jquery mobile doesn't like refreshing inividual listview items
        // when the listview has already been created so we need to change things manually

        var follow_button = this.$el.find("a[data-icon]");
        var following = this.model.get("relationship").you_follow;

        if (following)
        {
            follow_button
                .attr("data-icon", "check")
                .removeClass("follow")
                .addClass("unfollow");

            follow_button.find("span.ui-icon")
                    .removeClass("ui-icon-plus")
                    .addClass("ui-icon-check");
        }
        else
        {
            follow_button
                .attr("data-icon", "plus")
                .removeClass("unfollow")
                .addClass("follow");

            follow_button.find("span.ui-icon")
                    .removeClass("ui-icon-check")
                    .addClass("ui-icon-plus");
        }

        this.$el.find(".followers").text( this.model.get("followers") );
        this.$el.find(".photo-count").text( this.model.get("photo_count") );
    },

    events: {
        "click .follow": "follow",
        "click .unfollow": "unfollow"
    },

    follow: function()
    {
        var user = this.model;
        snapr.utils.require_login( function(){
            user.follow();
        })();
    },

    unfollow: function()
    {
        var user = this.model;
        snapr.utils.require_login( function(){
            user.unfollow();
        })();
    }
});