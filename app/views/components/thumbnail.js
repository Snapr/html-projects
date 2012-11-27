/*global _  define require T */
define(['views/base/view', 'views/components/no_results'], function(view, no_results){
return view.extend({

    initialize: function(){
        _.bindAll( this );
        this.back = this.options.back;
        this.load_template('components/thumbnail');
        this.collection.bind( "reset", this.render );
        this.collection.bind( "reset", $.mobile.hidePageLoadingMsg );
    },

    render: function( callback ){
        this.$el.html( this.template( {
            results: this.collection.models,
            back: this.back
        }) );
        if(!this.collection.length){
            no_results.render(T('No photos yet')+'...', 'delete').$el.appendTo(this.$el);
        }

        return this;
    }
});
});
