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
define(['config', 'backbone', 'utils/history_state'], function(config, Backbone, history_state){

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

    history_ignore_params: false,  // array of url params to ignore when navigating to a view via history

    activate: function(options){
        if(options === undefined){
            options = this.options;
        }

        if(this.history_ignore_params){
            // if we've been here before, ignore some params from the url,
            // they will reset page to original state not last state
            var ignore_params = history_state.get('ignore_params') || [];
            _.each(ignore_params, function(param){
                delete options.query[param];
            });
            history_state.set('ignore_params', this.history_ignore_params);
        }


        if(options){ this.dialog = options.dialog; }
        console.log('dialog?', this.dialog);

        var back_text;
        if(history_state.get('back_text')){
            back_text = history_state.get('back_text');
            console.log('back_text from history:', back_text);
        }else{
            var current_view = config.get('current_view');
            while(current_view && current_view.dialog){
                console.log("view is a dialog, checking prev one");
                current_view = current_view.previous_view;
            }
            if(current_view){
                if(current_view.title){
                    back_text = current_view.title;
                    console.log('back_text from view title:', back_text);
                }else{
                    back_text = current_view.$el.data('short-title') || current_view.$el.data('title');
                    console.log('back_text from view data(title):', back_text);
                }
            }else{
                console.log("no view in history that's not a dialog");
            }
        }
        this.set_back_text(back_text);
        this.post_activate.apply(this, options);
    },

    post_activate: function(){
        this.change_page();
    },

    set_back_text: function(text){
        // console.debug('set back text for', this.$el.selector, 'from', this.$("[data-rel='back'] .ui-btn-text").text(), 'to', text);
        if(text){
            this.$("[data-rel='back'] .ui-btn-text").text(text);
            history_state.set('back_text', text);
        }
        return this;
    },

    get_transition: function(){
        if(this.transition){
            return this.transition;
        }
        return "none";
        //return this.dialog ? "slideup" : "none";
    },
    change_page: function( options ){
        options = _.extend({
            changeHash: false,
            transition: this.get_transition()
        }, options || {});
        $.mobile.changePage( this.$el, options);
    },

    dialog_closed: function( dialog ){ /* called when a dialog is closed and this page is displayed again */ },

    back: function(){
        console.debug('back', this.dialog);
        if(this.dialog){
            if (this.previous_view){
                this.previous_view.change_page({
                    changeHash: false,
                    transition: this.transition,
                    reverse: true
                });
                config.set('current_view', this.previous_view);
                this.previous_view.dialog_closed(this);
            }else{
                Backbone.history.navigte('#');
            }
        }else{
            history.go(-1);
        }
    }
});
});
