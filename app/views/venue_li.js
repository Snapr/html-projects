snapr.views.venue_li = Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );

        this.template = this.options.template;

        this.model.bind( "change", this.refresh );

    },

    tagName: 'li',

    render: function()
    {
        $(this.el)
            .empty()
            .append( this.template({
                venue: this.model
            }) )

        return this;
    },

    refresh: function()
    {
        // unfortunately jquery mobile doesn't like refreshing inividual listview items
        // when the listview has already been created so we need to change things manually

        // var follow_button = $(this.el).find("a[data-icon]");
        // var following = this.model.get("relationship").you_follow;
        // if (following)
        // {
        //     follow_button
        //         .attr("data-icon", "check")
        //         .removeClass("follow")
        //         .addClass("unfollow")
        //         .find("span.ui-icon")
        //             .removeClass("ui-icon-plus")
        //             .addClass("ui-icon-check")
        // }
        // else
        // {
        //     follow_button
        //         .attr("data-icon", "plus")
        //         .removeClass("unfollow")
        //         .addClass("follow")
        //         .find("span.ui-icon")
        //             .removeClass("ui-icon-check")
        //             .addClass("ui-icon-plus")
        // }

    },

    events: {
        // "click .follow": "follow",
        // "click .unfollow": "unfollow"
    },

});