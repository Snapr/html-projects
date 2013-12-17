//extends app page, overridding only the activate function to allow for a custom tab_bar
define(['views/base/page', 'views/base/view', 'utils/history_state', 'views/components/bg_loader', '../../theme/views/tab_bar'],
    function(page_view, view, history_state, bg_loader, tab_bar){

    return page_view.extend({

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

            if(this.$el.data('tab-bar') === false){
                tab_bar.$el.hide();
            }else{
                tab_bar.$el.show();
            }

            if(options){ this.dialog = options.dialog; }

            this.set_back_text(options);

            // remove record of a panel being open
            this.$el.jqmRemoveData( "panel" );

            if(config.get('show_tab_bar') && this.$el.data('tab-bar') !== false){

                this.$el.addClass('s-has-tab-bar');

                tab_bar.render();
                this.$el.append(tab_bar.$el);
                tab_bar.$el.toolbar();

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

            window.scroll();  // go to top
    }

    });
});



