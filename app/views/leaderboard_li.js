/*global _  define require */
define(['backbone'], function(Backbone, auth){
return Backbone.View.extend({

    initialize: function(){
        _.bindAll( this);
        this.template = this.options.template;
        this.rank = this.options.rank;

        this.model.bind( "change", this.refresh );
    },

    tagName: 'li',

    render: function(){
        this.$el
            .html( this.template({
                user: this.model,
                rank: this.rank
            }) );

        return this;
    },

    refresh: function(){
        this.$(".photo-count").text( this.model.get("photo_count") );
    },

});
});
