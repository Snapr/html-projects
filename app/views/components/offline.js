snapr.views.offline = Backbone.View.extend({

    tagName: "div",

    initialize: function(){
        this.template = _.template( $("#offline-template").html() );
    },

    render: function(message, icon)
    {
        this.setElement(
            $( this.template() )
            .trigger("create")
        );

        return this;
    }

});

snapr.offline_el = new snapr.views.offline().render().el;
