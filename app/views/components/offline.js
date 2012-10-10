/*global _  define require */
define(['views/base/view'], function(view){
var offline = view.extend({

    tagName: "div",

    initialize: function(){
        this.load_template('components/offline');
    },

    render: function(message, icon){
        this.setElement(
            $( this.template() )
            .trigger("create")
        );

        return this;
    }

});

return new offline().render().el;

});
