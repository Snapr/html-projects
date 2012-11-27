/*global _  define require */
define(['views/base/view'], function(view){
var no_results = view.extend({

    tagName: "div",

    initialize: function(){
        this.load_template('components/no_results');
    },

    render: function(message, icon){
        this.$el
            .attr('id', 'x-no-results')
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
