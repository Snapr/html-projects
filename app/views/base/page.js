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
define(['config', 'backbone', 'utils/history_state', 'views/components/offline'], function(config, Backbone, history_state, offline_el){

return Backbone.View.extend({

    initialize: function(options){
        _.bindAll( this );

        this.events = _.extend(this.events || {}, {
            "click .x-back": "back",
            "click a[data-rel=back]": "back",
            "click a[data-back-here]": "add_back_url"
        });

        var page = this;
        this.$el.one( "pageshow", function(){
            page.set_back_text(options);
        });

        this.post_initialize.apply(this, arguments);
        this.activate.apply(this, arguments);
        $(document.body).show();
    },

    post_initialize: function(){},

    history_ignore_params: false,  // array of url params to ignore when navigating to a view via history

    activate: function(options){
        options = _.extend(options || {}, this.options);

        try{
            this.options.back_url = options.query.back_url;
        }catch(e){}

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

        this.set_back_text(options);

        this.post_activate.call(this, options);
    },

    post_activate: function(){
        this.change_page();
    },

    set_back_text: function(options){
        var back_text;
        if(this.back_text){
            back_text = this.back_text;
            console.log('back_text from view (hard coded):', back_text);
        }else if(history_state.get('back_text')){
            back_text = history_state.get('back_text');
            console.log('back_text from history:', back_text);
        }else{
            var previous_view = (options && options.retry) ? this.previous_view : config.get('current_view') ;
            while(previous_view && previous_view.dialog){
                console.log("view is a dialog, checking prev one");
                previous_view = previous_view.previous_view;
            }
            if(previous_view){
                if(previous_view.title){
                    back_text = previous_view.title;
                    console.log('back_text from view title:', back_text);
                }else{
                    back_text = previous_view.$el.data('short-title') || previous_view.$el.data('title');
                    console.log('back_text from view data(title):', back_text);
                }
            }else{
                console.log("no view in history that's not a dialog");
            }
        }

        console.debug('set back text for', this.$el.selector, 'from', this.$("[data-rel='back'] .ui-btn-text").text(), 'to', back_text);
        this.$("[data-rel='back'] .ui-btn-text").text(back_text);
        history_state.set('back_text', back_text);
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

    add_back_url: function(e){
        var dest = e.target.hash;
        dest += dest.indexOf('?') == -1 ? "?" : "&";
        dest += "back_url=" + escape(window.location.hash);
        Backbone.history.navigate(dest);
        e.preventDefault();
        return false;
    },

    back: function(e){
        if(this.options.back_url){
            console.debug('Back to back_url:', this.options.back_url);
            Backbone.history.navigate(this.options.back_url);
            if(e){
                e.preventDefault();
            }
            return false;
        }
        if(this.dialog){
            if (this.previous_view){
                console.debug('Back to previous_view:', this.previous_view, '(This is a dialog)');
                this.previous_view.change_page({
                    changeHash: false,
                    transition: this.get_transition(),
                    reverse: true
                });
                config.set('current_view', this.previous_view);
                this.previous_view.dialog_closed(this);
            }else{
                console.debug('Back to # (This is a dialog, no previous_view)');
                Backbone.history.navigate('#');
            }
        }else{
            console.debug('Back via history');
            history.go(-1);
        }
    },

    offline: function(offline_mode){
        if(offline_mode){
            this.$('[data-role=content]').prepend(offline_el).trigger("create");
        }else{
            $('.x-offline').remove();
        }
    }
});
});
