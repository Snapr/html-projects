/*global _  define require */
define(['backbone'], function(Backbone){
var offline = Backbone.View.extend({

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

return new offline().render().el;

});
