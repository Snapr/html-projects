// Abstract base class for pages

/*global _  define require */

/*
things to define:
Page{
    post_initialize{
        things to do once only - when view first used
    }
    activate{
        everytime the view is shown
        responsible for calling render
    }
    render{
        everytime view is showen or something changes
    }
}
*/
define(['backbone'], function(Backbone){

return Backbone.View.extend({

    initialize: function(options){
        _.bindAll( this );

        this.events = _.extend(this.events || {}, {
            "click .x-back": "back"
        });

        this.post_initialize.apply(this, arguments);
        this.activate.apply(this, arguments);
        $(document.body).show();
    },

    post_initialize: function(){},

    activate: function(options){
        if(options){ this.dialog = options.dialog; }

        var back_text;
        if(history.state && history.state.back_text){
            back_text = history.state.back_text;
        }else{
            var current_view = snapr.info.current_view;
            while(current_view && current_view.dialog){
                current_view = current_view.previous_view;
            }
            if(current_view){
                back_text = current_view.$el.data('short-title') || current_view.$el.data('title');
            }
        }
        this.set_back_text(back_text);
        this.post_activate.apply(this, arguments);
    },

    post_activate: function(){
        this.change_page();
    },

    set_back_text: function(text){
        if(text){
            this.$("[data-rel='back'] .ui-btn-text").text(text);
            window.history.replaceState({'back_text': text}, 'title', window.location);
        }
        return this;
    },

    get_transition: function(){
        if(this.transition){
            return this.transition;
        }
        return this.dialog ? "slideup" : "none";
    },
    change_page: function( options ){
        options = _.extend({
            changeHash: false,
            transition: this.get_transition()
        }, options || {});
        $.mobile.changePage( this.$el, options);
    },

    back: function(){
        console.debug('back', this.dialog);
        if(this.dialog){
            if (this.previous_view){
                this.previous_view.change_page({
                    changeHash: false,
                    transition: this.transition,
                    reverse: true
                });
                snapr.info.current_view = this.previous_view;
            }else{
                Backbone.history.navigte('#');
            }
        }else{
            history.go(-1);
        }
    }
});
});
