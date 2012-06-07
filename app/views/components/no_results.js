/*global _ Route define require */
define(['backbone'], function(Backbone){
var no_results = Backbone.View.extend({

    tagName: "div",

    initialize: function(){
        this.template = _.template( $("#no-results-template").html() );
    },

    render: function(message, icon){
        this.$el
            .attr('id', 'no-results')
            .html( this.template({
                message: message,
                icon: icon
            }))
            .trigger("create");

        return this;
    }

});

return new no_results();
});
