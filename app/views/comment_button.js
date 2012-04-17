snapr.views.comment_button = Backbone.View.extend({

    initialize: function()
    {
        this.setElement( this.options.el );
        this.li = this.options.li;
        this.template = _.template( $("#comment-button-template").html() );
        _.bindAll( this );

        // update the display when the comment count changes
        this.model.bind( "change:comments", this.render );
    },

    render: function()
    {
        var selected = this.$el.find( ".selected" ).length > 0;
        this.$el.html( this.template({
            count: parseInt( this.model.get( "comments" ) ),
            selected: selected
        }));

        $(this.li.el).trigger("create");

        return this
    }

});