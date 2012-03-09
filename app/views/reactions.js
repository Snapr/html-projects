snapr.views.reactions = Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );

        this.collection = new snapr.models.reaction_collection;
        this.collection.data = {
            photo_id: this.id
        };
        this.collection.bind( "reset", this.render );
        this.collection.bind( "change", this.render );

        this.collection.fetch();
    },

    template: _.template( $('#reaction-li-template').html() ),

    render: function( callback )
    {
        var $el = this.el.empty();
        _.each( this.collection.models, function( reaction )
        {
            $el.append(this.template({
                reaction: reaction
            }));
        }, this);
        $el.trigger('create').listview().listview('refresh');

        if (callback && typeof callback == 'function')
        {
            callback();
        }
    }

});
