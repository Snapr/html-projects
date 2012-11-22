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
define(['config', 'backbone', 'views/base/view', 'utils/history_state', 'views/components/offline', 'views/components/bg_loader', 'views/components/tab_bar'], function(config, Backbone, view, history_state, offline_el, bg_loader, tab_bar){

return view.extend({

    initialize: function(options){
        _.bindAll( this );

        this.load_template();
        this.create_page();

        this.events = _.extend(this.events || {}, {
            "click .x-back": "back",
            "click a[data-rel=back]": "back",
            "click a.x-back-here": "add_back_url"
        });

        var page = this;
        this.$el.one( "pageshow", function(){
            page.set_back_text(options);
        });

        this.trigger('initialize');

        this.post_initialize.apply(this, arguments);
        this.activate.apply(this, arguments);
        $(document.body).show();
    },

    post_initialize: function(){},

    get_default_tab: function(){},  // set the tab to this always
    get_override_tab: function(){},  // set the tab to this if no other is selected (arriving via url etc)

    history_ignore_params: false,  // array of url params to ignore when navigating to a view via history

    create_page: function(){
        this.setElement($(this.template({initial: true})));
        this.$el.appendTo(document.body);
    },

    activate: function(options){
        options = _.extend(options || {}, this.options);

        this.show_bg_loader(false);

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

        this.set_back_text(options);

        if(config.get('show_tab_bar') && this.$el.data('tab-bar')){
            this.$el.append(tab_bar.$el);
            tab_bar.render();

            var tab_override = this.get_override_tab();
            if(tab_override){
                tab_bar.set_active(tab_override);
            }else{
                // the active tab is storred in history so the back button activates the old tab too.
                var active_history = history_state.get('active_tab');
                if(active_history){
                    tab_bar.set_active(active_history);
                }else if(!tab_bar.active){
                    // fallback to default
                    tab_bar.set_active(this.get_default_tab());
                }
                history_state.set('active_tab', tab_bar.active);
            }
        }

        this.trigger('activate');

        this.post_activate.call(this, options);
    },

    post_activate: function(){
        this.change_page();
    },

    set_back_text: function(options){
        var back_text;
        if(this.back_text){
            back_text = this.back_text;
        }else if(history_state.get('back_text')){
            back_text = history_state.get('back_text');
        }else{
            var previous_view = (options && options.retry) ? this.previous_view : config.get('current_view') ;
            while(previous_view && previous_view.dialog){
                previous_view = previous_view.previous_view;
            }
            if(previous_view){
                if(previous_view.title){
                    back_text = previous_view.title;
                }else{
                    back_text = previous_view.$el.data('short-title') || previous_view.$el.data('title');
                }
            }
        }

        this.$("[data-rel='back'] .ui-btn-text").text(back_text);
        if(!this.dialog){
            history_state.set('back_text', back_text);
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
            Backbone.history.navigate(this.options.back_url);
            if(e){
                e.preventDefault();
            }
            return false;
        }
        if(this.dialog){
            if (this.previous_view){
                this.previous_view.change_page({
                    changeHash: false,
                    transition: this.get_transition(),
                    reverse: true
                });

                console.groupEnd(this.options.name);
                console.group(this.previous_view.options.name);

                config.set('current_view', this.previous_view);
                this.previous_view.dialog_closed(this);
            }else{
                Backbone.history.navigate('#');
            }
        }else{
            history.go(-1);
        }
    },

    show_bg_loader: function(show){
        show = show !== false;  // false hides ANYTHING else shows
        $(document.body).toggleClass('x-bg-loading', show);
        if(!config.get('show_tab_bar') || !this.$el.data('tab-bar')){
            if(show){
                this.$el.append(bg_loader);
            }else{
                bg_loader.remove();
            }
        }

    },

    offline: function(offline_mode){
        if(offline_mode){
            this.$('[data-role=content]').prepend(offline_el).trigger("create");
        }else{
            $('.x-offline').remove();
        }
    },

    uncache: function(){
        var this_view = this;
        require(['routers'], function(routers){
            _.any(routers.routers_instance.urls, function(url, i) {
                if (url.callback.cached_view == this_view) {
                    url.callback.cached_view = null;
                }
            });
        });
    }
});
});
