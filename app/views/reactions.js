snapr.views.reactions = Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );
        this.setElement( this.options.el );

        this.collection = new snapr.models.reaction_collection();
        this.collection.data = {
            photo_id: this.id
        };
        this.collection.bind( "reset", this.render );
        this.collection.bind( "change", this.render );
        this.template = _.template( $('#reaction-li-template').html() );
    },

    render: function()
    {
        this.$el.empty();
        _.each( this.collection.models, function( reaction )
        {
            this.$el.append(this.template({
                reaction: reaction
            }));
        }, this);
        this.$el.trigger('create').listview().listview('refresh');
    }

});
