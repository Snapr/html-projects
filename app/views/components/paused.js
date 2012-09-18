/*global _  define require */
define(['backbone', 'native', 'config'], function(Backbone, native, config){
var paused = Backbone.View.extend({

    tagName: "div",

    render: function(message, icon){
        this.setElement( $('.x-resume-queue').show().remove() );
        $('.x-resume-queue').live('click', function(){
            native.pass_data('snapr://upload?start');
            config.set('paused', false);
        });
        return this;
    }

});

return new paused().render().el;

});
