snapr.views.no_results = Backbone.View.extend({

    tagName: "div",

    initialize: function(){
        this.template = _.template( $("#no-results-template").html() );
    },

    render: function(message, icon)
    {
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

snapr.no_results = new snapr.views.no_results();
