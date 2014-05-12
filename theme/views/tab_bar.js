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
        'click .x-menu-button': 'open_menu',
        'touchend a': 'unusedActive'
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

        if (tab === "post") {
            this.post_active_state();
        }

        return this;
    },

    post_active_state: function() {
        var currentPage = Backbone.history.fragment;
        $('#post-btn').removeClass('ui-btn-active');
        if (currentPage ==="nearby/" || currentPage === "all/" || currentPage === "" || currentPage.indexOf("access_token")!==-1) {
            $('#browse-btn').addClass('ui-btn-active');
        }else if (currentPage === "map/") {
            $('#map-btn').addClass('ui-btn-active');
        }
    },

    handle_click: function(event){
        // this is about setting this.active so that if it's re-rended this
        // will still be correct adding the class is done by jQm anyway
        var tab = $(event.currentTarget).data('name');
        if(tab){
            this.set_active(tab);
        }
        if (tab === "browse"){
            this.direct_browse();
        }else if (tab === "map"){
            window.location.href = '#/map/';
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

    open_menu: function(){
        $('.x-side-menu').panel('open');
    },

    menu_click: function(e){
        // close menu if you click on a link to the current view
        var link = $(e.currentTarget);
        if(link.attr('href').split('?')[0] == window.location.hash.split('?')[0]){
            $('.x-side-menu').panel('close');
        }
    },

    side_menu_callbacks:{

    },

    direct_browse: function(e){
        var currentPage = Backbone.history.fragment;
        if (currentPage === "" || currentPage === "all/" || currentPage ==="nearby/") {
            $('#radius-menu').popup('open');
        } else {
            window.location.href = '#/nearby/';
        }
        e.preventDefault();
    },

    unusedActive: function(){
        $.mobile.activeBtnClass = 'unused';
    },

});

return new tab_bar();
});
