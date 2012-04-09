snapr.views.activity_stream_item = Backbone.View.extend({

    tagName: "div",

    className: "activity-item",

    events: {
       // "click #popular-timeframe a":"update_list"
    },

    initialize: function()
    {
        _.bindAll( this );

        this.template = _.template( $("#activity-stream-item-template").html() );

    },

    render: function()
    {
        var likes_list = _.map( this.model.get("favorites"), function(f){return f.user.username});
        console.warn("likes_list", likes_list);
        $(this.el).html( this.template({
            item: this.model,
            likes_list: likes_list
        }));

        switch (this.model.get("type"))
        {
            case "photo-activity":
                $(this.el).addClass("activity-image-item");
                break;
            case "follow":
                $(this.el).addClass("activity-follow-item");
                break;
        }
        return this;
    }

});
