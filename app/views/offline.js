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
            .click(snapr.retry_connection)
        );

        return this;
    }

});

snapr.offline_view = new snapr.views.offline();
