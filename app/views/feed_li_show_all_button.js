snapr.views.feed_li_show_all_button = Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );

        this.li = this.options.li;
        $(this.options.el).undelegate();
        this.setElement( this.options.el );
        this.template = _.template( $("#show-all-button-template").html() );

        // update the display when we fav/unfav or comment
        this.model.bind( "change", this.render );
    },

    render: function()
    {
        var selected = this.$el.find(".selected").length > 0;
        this.$el.html( this.template({
            reactions: parseInt( this.model.get("favorite_count")) + parseInt( this.model.get("comments")),
            selected: selected
        }));

        this.li.$el.trigger("create");

        return this;
    }

});