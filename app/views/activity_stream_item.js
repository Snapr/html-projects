snapr.views.activity_stream_item = Backbone.View.extend({

    tagName: "li",

    className: "activity-item",

    initialize: function()
    {
        _.bindAll( this );

        this.photo_events = this.options.photo_events;
        this.template = _.template( $("#activity-stream-item-template").html() );
    },

    render: function()
    {
        var likes_list = _.map( this.model.get("favorites"), function(f){return f.user.username});

        this.$el.html( this.template({
            item: this.model,
            photo_events: this.photo_events,
            likes_list: likes_list
        }));

        switch (this.model.get("type"))
        {
            case "photo-activity":
                this.$el.addClass("activity-image-item");
                break;
            case "follow":
                this.$el.addClass("activity-follow-item");
                break;
        }
        return this;
    }

});
