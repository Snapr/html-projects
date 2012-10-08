/*global _  define require */
define(['backbone', 'auth'], function(Backbone, auth){
var tab_bar = Backbone.View.extend({

    tagName: "div",

    initialize: function(){
        this.template = _.template( $('#tab-bar-template').html() );
        auth.on('change', this.render, this);
    },

    render: function(message, icon){
        var html = this.template({
            username: auth.get('snapr_user')
        });
        var rendered = $( html );

        this.$el.html(html).trigger("create");
        // this.setElement(rendered);
        // this.$el.trigger("create");

        return this;
    }

});

return tab_bar;
});
