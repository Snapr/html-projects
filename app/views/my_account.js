/*global _  define require */
define(['views/base/page', 'views/linked_service', 'auth', 'utils/local_storage', 'utils/alerts', 'native', 'config'],
function(page_view, linked_service, auth, local_storage, alerts, native, config){
return page_view.extend({

    post_activate:function(options){

        this.options.back_url = "#/";

        this.change_page();

        if(options.query.username){
            auth.user_settings.cache_bust();
        }

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
        auth.user_settings.cache_bust();
        this.fetch();
    },

    fetch: function(){
        $.mobile.showPageLoadingMsg();
        var my_account_view = this;
        var options = {
            data: {linked_services: true, user_object: true},
            success: function(){
                $.mobile.hidePageLoadingMsg();
                auth.user_settings.linked_services_setup();
                my_account_view.render();
            },
            error: function(){
                console.log( 'error' , my_account_view );
            }
        };
        auth.user_settings.data = {};
        auth.user_settings.fetch( options );
    },

    render: function(){

        var data={
            initial: false,
            username: auth.user_settings.get( "user" ).username,
            display_username: auth.user_settings.get( "user" ).display_username,
            user_id: auth.user_settings.get( "user" ).user_id,
            settings: auth.user_settings.get( "settings" ),
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

        var new_page = $(this.template(data));

        var $account_content = this.$('.x-content').replaceWith(new_page.find('.x-content')).trigger('create');


        // set all linked services to false, we will check them off below

        var linked_services_list = {
            foursquare:false,
            facebook:false,
            tumblr:false,
            twitter:false
        };

        var my_account = this;
        _.each( auth.user_settings.get('linked_services'), function( service, index ){
            var v = new linked_service({model: service});
            v.my_account = my_account;

            // keep track of linked services
            linked_services_list[service.provider] = true;

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
            $.mobile.showPageLoadingMsg();
        }
        // prevent backbone from thinking this is a new user
        auth.user_settings.id = true;
        auth.user_settings.set(param);
        var my_account = this;

        auth.user_settings.save({},{
            data: param,
            success: function( model, xhr ){
                $.mobile.hidePageLoadingMsg();
                if (xhr.success){
                    if($.isFunction(callback)){
                        callback( model, xhr );
                    }
                }else{
                    $.mobile.hidePageLoadingMsg();
                    console.warn( "error saving notifications", xhr );
                    alerts.notification('Error',  "Sorry, we had trouble saving your settings." );
                    my_account.initialize();
                }
            },
            error: function( e ){
                console.warn( "error saving notifications", e );
                alerts.notification('Error',  "Sorry, we had trouble saving your settings." );
                my_account.initialize();
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

        var my_account = this,
            param = {};

        _.each(['name', 'location', 'website', 'bio'], function(item){
            param[item] = section.find(".x-"+item).val();
        });

        param.avatar_type = section.find('.x-avatar :checked').val();
        var current_avatar = auth.user_settings.get('avatar_type') || auth.user_settings.get('settings').profile.avatar_type;
        var avatar_changed = param.avatar_type !== current_avatar;

        this.save_settings( param, function(){
            if(avatar_changed){
                auth.user_settings.cache_bust();
                my_account.fetch();
            }else{
                alerts.notification('Thanks', 'Your settings have been saved');
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
            alerts.notification("No email", "Please provide an email address", $.noop);
            return;
        }else{
            if (email != auth.user_settings.get("settings") && auth.user_settings.get("settings").email){
                param.email = email;
            }
        }
        if (password){
            if (!password_verify){
                alerts.notification("No verification password", "Please enter your password again", $.noop);
                return;
            }else if (password != password_verify){
                alerts.notification("Passwords don't match", "Please enter your password again", $.noop);
                return;
            }else{
                param.password = password;
            }
        }

        if (!_.isEmpty( param )){
            this.save_settings( param, function(){
                alerts.notification('Thanks', 'Your settings have been saved');
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
            native.pass_data( "snapr://camplus/settings/?" + $.param( param ) );
        }else{
            console.log( "snapr://camplus/settings/?" + $.param( param ) );
        }
    },

    queue_settings: function( upload_mode, paused ){
        this.render();
    }

});

});
