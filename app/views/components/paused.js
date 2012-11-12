/*global _  define require */
define(['views/base/view', 'native_bridge', 'config'], function(view, native_bridge, config){
var paused = view.extend({

    tagName: "div",

    initialize: function(){
        this.load_template('components/paused');
    },


    render: function(message, icon){
        this.setElement(
            $( this.template() )
            .trigger("create")
        );
        $('.x-resume-queue').live('click', function(){
            native_bridge.pass_data('snapr://upload?start');
            config.set('upload_paused', false);
        });
        return this;
    }

});

return new paused().render().el;

});
