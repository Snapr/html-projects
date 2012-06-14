/*global _  define require */
define(['backbone', 'views/components/no_results'], function(Backbone, no_results){
return Backbone.View.extend({

    initialize: function(){
        _.bindAll( this );
        this.back = this.options.back;
        this.collection.bind( "reset", this.render );
        this.collection.bind( "reset", $.mobile.hidePageLoadingMsg );
    },

    template: _.template( $("#thumb-li-template").html() ),

    render: function( callback ){
        this.$el.html( this.template( {
            results: this.collection.models,
            back: this.back
        }) );
        if(!this.collection.length){
            no_results.render('No photos yet...', 'delete').$el.appendTo(this.$el);
        }

        return this;
    }
});
});
