/*global _ Route define require */
define(['backbone'], function(Backbone){
return Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );
        this.back = this.options.back;
        this.collection.bind( "reset", this.render );
        this.collection.bind( "reset", $.mobile.hidePageLoadingMsg );
    },

    template: _.template( $("#thumb-li-template").html() ),

    render: function( callback )
    {
        this.$el.html( this.template( {
            results: this.collection.models,
            back: this.back
        }) );
        if(!this.collection.length){
            snapr.no_results.render('No photos yet...', 'delete').$el.appendTo(this.$el);
        }

        return this;
    }
});
});
