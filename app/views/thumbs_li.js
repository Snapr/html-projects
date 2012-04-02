snapr.views.thumbs_li = Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );
        this.collection.bind( "reset", this.render );
        this.collection.bind( "reset", $.mobile.hidePageLoadingMsg );
    },

    template: _.template( $("#thumb-li-template").html() ),

    render: function( callback )
    {
        var $el = $(this.el).empty();

        $el.html( this.template( { results: this.collection.models } ) )

        return this;
    }
})
