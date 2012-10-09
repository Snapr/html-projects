/*global _  define require */
define(['backbone', 'auth', 'config'], function(Backbone, auth, config){
var tab_bar = Backbone.View.extend({

    tagName: "div",
    active: null,

    initialize: function(){
        this.template = _.template( $('#tab-bar-template').html() );
        // auth.on('change', this.render, this);  // this is no longer needed because the bar is rendered every page change
    },

    events:{
        'click a': 'handle_click'
    },

    render: function(message, icon){
        var html = this.template({
            username: auth.get('snapr_user')
        });
        this.$el.html(html).trigger("create");

        if(this.active){
            this.set_active(this.active);
        }

        return this;
    },

    set_active: function(tab){
        this.active = tab;
        this.$('.'+$.mobile.activeBtnClass).removeClass($.mobile.activeBtnClass);
        this.$('[data-name="' + tab + '"]').addClass($.mobile.activeBtnClass);

        return this;
    },

    handle_click: function(e){
        // this is about setting this.active so that if it's re-rended this
        // will still be correct adding the class is done by jQm anyway
        this.set_active($(e.currentTarget).data('name'));
    }

});

return new tab_bar();
});
