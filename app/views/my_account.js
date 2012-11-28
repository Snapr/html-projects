/*global _  define require */
define(['views/base/page', 'views/linked_service', 'auth', 'utils/local_storage', 'utils/alerts', 'native_bridge', 'config'],
function(page_view, linked_service, auth, local_storage, alerts, native_bridge, config){
return page_view.extend({

    post_activate:function(options){

        this.options.back_url = "#/";

        this.change_page();

        this.fetch();

    },

    get_override_tab: function(){ return 'feed'; },

    back_text: "Menu",

    create_page: function(){
        this.setElement($(this.template({
            initial: true,
            username: auth.get( "snapr_user" ),
            display_username: auth.get( "display_username" )
        })));
        this.$el.appendTo(document.body);
    },

    dialog_closed: function(dialog){
        this.fetch();
    },

    fetch: function(){
        this.show_bg_loader();
        var this_view = this;
        var options = {
            data: {linked_services: true, user_object: true},
            success: function(){
                this_view.show_bg_loader(false);
                auth.user_settings.linked_services_setup();
                this_view.render();
            },
            error: function(){
                this_view.show_bg_loader(false);
                console.log( 'error' , this_view );
            }
        };
        auth.user_settings.data = {};
        auth.user_settings.fetch( options );
    },

    render: function(){

        var linked_services_list = {
            foursquare:false,
            facebook:false,
            tumblr:false,
            twitter:false
        };

        _.each( auth.user_settings.get('linked_services'), function( service, index ){
            linked_services_list[service.provider] = true;
        });

        var data={
            initial: false,
            username: auth.user_settings.get( "user" ).username,
            display_username: auth.user_settings.get( "user" ).display_username,
            user_id: auth.user_settings.get( "user" ).user_id,
            settings: auth.user_settings.get( "settings" ),
            linked_services: linked_services_list,
            camplus: false
        };
        if(config.get('camplus_options')){
            data.camplus = {
                camplus_menu: (local_storage.get( "camplus" ) == "true"),
                camplus_camera: (local_storage.get( "camplus_camera" ) == "true"),
                camplus_edit: (local_storage.get( "camplus_edit" ) == "true"),
                camplus_lightbox: (local_storage.get( "camplus_lightbox" ) == "true")
            };
        }

        var $account_content = this.replace_from_template(data, ['.x-content']).trigger('create');


        var this_view = this;
        _.each( auth.user_settings.get('linked_services'), function( service, index ){
            var v = new linked_service({model: service});
            v.my_account = this_view;

            $account_content.find('.x-linked-services').append( v.render().el ).trigger('create');
        });

        // for all services that are not yet linked, add
        _.each( linked_services_list, function( val, provider ){
            if (!val){
                var v = new linked_service();
                v.provider = provider;
                $account_content.find('.x-add-services').append( v.render().el ).trigger('create');
            }
        });

        $account_content.find('.x-add-services').listview().listview("refresh");

        var hide_connect_heading = _.filter(linked_services_list, function(val){return !val;}).length ? false: true;
        var hide_linked_heading = _.filter(linked_services_list, function(val){return val;}).length ? false: true;
        if (hide_connect_heading){
            this.$(".x-connect-heading").hide();
        }
        if (hide_linked_heading){
            this.$(".x-linked-heading").hide();
        }

        return this;
    },

    events: {
        "change .x-avatar input[type=radio]": "set_avatar",
        "click .x-set-up-gravatar": "set_up_gravatar",
        "click .x-notifications .x-save": "save_notifications",
        "change .x-notifications .ui-slider-switch": "save_notifications",
        "click .x-account .x-save": "save_account",
        "click .x-camplus .x-save": "save_camplus",
        "click .x-profile .x-save": "save_profile"
    },

    set_avatar: function(e){
        var avatar_type = this.$('.x-avatar input[type=radio]:checked').val();
        console.debug(avatar_type);
    },

    set_up_gravatar: function(){
        window.open( "http://en.gravatar.com/" );
    },

    save_settings: function( param, callback, spin ){
        if(spin){
            this.show_bg_loader();
        }
        // prevent backbone from thinking this is a new user
        auth.user_settings.id = true;
        auth.user_settings.set(param);
        var this_view = this;

        auth.user_settings.save({},{
            data: param,
            success: function( model, xhr ){
                this_view.show_bg_loader(false);
                if (xhr.success){
                    if($.isFunction(callback)){
                        callback( model, xhr );
                    }
                }else{
                    console.warn( "error saving notifications", xhr );
                    alerts.notification('Error',  T("Sorry, we had trouble saving your settings.") );
                    this_view.initialize();
                }
            },
            error: function( e ){
                this_view.show_bg_loader(false);
                console.warn( "error saving notifications", e );
                alerts.notification('Error',  T("Sorry, we had trouble saving your settings." ));
                this_view.initialize();
            }
        });
    },

    save_notifications: function( e ){
        var $collapse = $(e.currentTarget).closest("[data-role='collapsible']");
        var selects = $collapse.find("select");

        var param = {};

        _.each(selects, function(select){
            param[$(select).attr("name")] = ($(select).val() == "true") ? true: false;
        });

        this.save_settings( param, null, false );
    },

    save_profile: function( e ){
        var section = $(e.currentTarget).closest("[data-role='collapsible']");

        var this_view = this,
            param = {};

        _.each(['name', 'location', 'website', 'bio'], function(item){
            param[item] = section.find(".x-"+item).val();
        });

        param.avatar_type = section.find('.x-avatar :checked').val();
        var current_avatar = auth.user_settings.get('avatar_type') || auth.user_settings.get('settings').profile.avatar_type;
        var avatar_changed = param.avatar_type !== current_avatar;

        this.save_settings( param, function(){
            if(avatar_changed){
                my_account.fetch();
            }else{
                alerts.notification('Thanks', T('Your settings have been saved'));
            }
        });
    },

    save_account: function( e ){
        var param = {};

        var email = this.$(".x-email").val();
        var password = this.$(".x-password").val();
        var password_verify = this.$(".x-password-verify").val();

        this.$(".x-password").val("");
        this.$(".x-password-verify").val("");

        if (!email){
            alerts.notification("No email", T("Please provide an email address"), $.noop);
            return;
        }else{
            if (email != auth.user_settings.get("settings") && auth.user_settings.get("settings").email){
                param.email = email;
            }
        }
        if (password){
            if (password.length < 6){
                alerts.notification("Password too short", T("Passwords must be at least six characters long."), $.noop);
                return;
            }else if (!password_verify){
                alerts.notification("No verification password", T("Please enter your password again"), $.noop);
                return;
            }else if (password != password_verify){
                alerts.notification("Passwords don't match", T("Please enter your password again"), $.noop);
                return;
            }else{
                param.password = password;
            }
        }

        if (!_.isEmpty( param )){
            this.save_settings( param, function(){
                alerts.notification('Thanks', T('Your settings have been saved'));
            });
        }
    },

    save_camplus: function( e ){
        var selects = $(e.currentTarget).closest("[data-role='collapsible'] select");

        var param = {};

        _.each( selects, function( select ){
            var key = $(select).attr("name");
            var value = ($(select).val() == "true") ? true: false;
            param[key] = value;
            local_storage.set( key, value );
        });

        if (local_storage.get("appmode") == "iphone"){
            native_bridge.pass_data( "snapr://camplus/settings/?" + $.param( param ) );
        }else{
            console.log( "snapr://camplus/settings/?" + $.param( param ) );
        }
    }

});

});
