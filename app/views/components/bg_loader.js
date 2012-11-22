/*global _  define require */
define(['views/base/view'], function(view){
var loader = view.extend({

    initialize: function(){
        this.load_template('components/bg_loader');
    },

    render: function(template){
        this.setElement(
            $( this.template() )
            .trigger("create")
        );

        return this;
    }

});

return new loader().render().el;

});
