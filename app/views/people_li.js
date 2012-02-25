snapr.views.people_li = Backbone.View.extend({

    initialize: function()
    {
        this.template = this.options.template;

        var people_li = this;

        this.model.bind( "change", function()
        {
            people_li.refresh();
        });

    },

    tagName: 'li',

    render: function()
    {
        $(this.el)
            .empty()
            .append( this.template({
                user: this.model,
                auth_username: snapr.auth.get( "snapr_user" )
            }) )

        return this;
    },

    refresh: function()
    {
        // unfortunately jquery mobile doesn't like refreshing inividual listview items
        // when the listview has already been created so we need to change things manually

        var follow_button = $(this.el).find("a[data-icon]");
        var following = this.model.get("relationship").you_follow;
        if (following)
        {
            follow_button
                .attr("data-icon", "check")
                .removeClass("follow")
                .addClass("unfollow")
                .find("span.ui-icon")
                    .removeClass("ui-icon-plus")
                    .addClass("ui-icon-check")
        }
        else
        {
            follow_button
                .attr("data-icon", "plus")
                .removeClass("unfollow")
                .addClass("follow")
                .find("span.ui-icon")
                    .removeClass("ui-icon-check")
                    .addClass("ui-icon-plus")
        }

        $(this.el).find(".followers").text( this.model.get("followers") );
        $(this.el).find(".photo-count").text( this.model.get("photo_count") );
    },

    events: {
        "click .follow": "follow",
        "click .unfollow": "unfollow"
    },

    follow: function()
    {
        this.model.follow();
    },

    unfollow: function()
    {
        this.model.unfollow();
    }

});