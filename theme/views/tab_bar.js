//overwrites original (bc returns a new instance rather than a view, and not using snapr original)
//still, kept it as close as possible

/*global _, define, require */
define(['views/base/view', 'auth', 'config', 'collections/upload_progress', 'views/components/activity_count', 'utils/history_state'], function(view, auth, config, upload_progress_collection, activity_count, history_state){
var tab_bar = view.extend({

    tagName: "div",
    active: null,

    initialize: function(){  var self = this;
        self.load_template(config.get('tab_bar_template'));

        self.side_menu_template = self.get_template(config.get('side_menu_template'));
        self.render_side_menu();
        self.side_menu.on('click', 'a', _.bind(this.menu_click, this));

        auth.on('change:access_token', _.bind(self.render_side_menu, self));

    },

    events:{
        'click a': 'handle_click',
        // 'click .x-menu-button': 'open_menu',
        'change #browse': 'select_menu' //tc
    },

    select_menu: function(){
        var selected = self.$('#browse').val();
        if (selected === "browse") {
            window.location.href = '/#/browse/';
            $('div[data-role="footer"]').show();
        } else if(selected === "map") {
            window.location.href = '/#/map/';
            $('div[data-role="footer"]').hide();
        }else {
            window.location.href = '/#/search/';
            $('div[data-role="footer"]').hide();
        }
    },

    render: function(message, icon){
        var html = this.template({
            username: auth.get('snapr_user')
        });

        this.$el.remove();
        var rendered = $(html);
        this.setElement(rendered);

        if(this.active){
            this.set_active(this.active);
        }

        var count = upload_progress_collection.length;
        this.$('.x-upload-count').toggle(!!count).text(count);

        activity_count.update();

        return this;
    },

    set_active: function(tab){
        this.active = tab;

        // tabs
        this.$('.ui-btn-active').removeClass('ui-btn-active');
        var active_element = this.$('[data-name="' + tab + '"]').addClass('ui-btn-active');
        if(!active_element.length){
            this.$('[data-name="' + config.get('default_tab') + '"]').addClass('ui-btn-active');
        }

        // side menu
        $('.x-side-menu .ui-btn-active').removeClass('ui-btn-active');
        $('.x-side-menu [data-slug="' + tab + '"]').addClass('ui-btn-active');

        history_state.set('active_tab', tab);

        return this;
    },

    handle_click: function(event){
        // this is about setting this.active so that if it's re-rended this
        // will still be correct adding the class is done by jQm anyway
        var tab = $(event.currentTarget).data('name');
        if(tab){
            this.set_active(tab);
        }
    },

    render_side_menu: function(){  var self = this;

        var rendered = $(self.side_menu_template());
        if(!self.side_menu){
            self.side_menu = rendered.appendTo(document.body).enhanceWithin().panel();
        }else{
            self.side_menu.find('.x-content').empty().append(rendered.find('.x-content').children()).enhanceWithin();
        }

        _.each(config.get('side_menu_options'), function(item){
            if(self.side_menu_callbacks[item.slug]){
                self.side_menu_callbacks[item.slug](self.side_menu, item);
            }
        });

        this.set_active(this.active);
    },

    // open_menu: function(){
    //     $('.x-side-menu').panel('open');
    // },

    menu_click: function(e){
        // close menu if you click on a link to the current view
        var link = $(e.currentTarget);
        if(link.attr('href').split('?')[0] == window.location.hash.split('?')[0]){
            $('.x-side-menu').panel('close');
        }
    },

    side_menu_callbacks:{

    }

});

return new tab_bar();
});
