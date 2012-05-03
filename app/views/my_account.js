snapr.views.my_account = snapr.views.page.extend({

    initialize:function()
    {
        snapr.views.page.prototype.initialize.call( this );

        this.change_page();

        this.user_settings = new snapr.models.user_settings();

        var my_account_view = this;
        var options = {
            data: {linked_services: true, user_object: true},
            success: function()
            {
                $.mobile.hidePageLoadingMsg();
                my_account_view.user_settings.linked_services_setup();
                my_account_view.render();
            },
            error: function()
            {
                console.log( 'error' , my_account_view );
            }
        };
        $.mobile.showPageLoadingMsg();
        this.user_settings.fetch( options );
    },

    template: _.template( $('#my-account-template').html() ),

    render: function()
    {
        var $account_content = this.$el.find('.account-content').empty();

        // hidden for the moment

        // if (snapr.utils.get_local_param("appmode"))
        // {
        //     this.upload_settings = new snapr.views.upload_settings();
        //     $account_content.prepend( this.upload_settings.render().el );
        // }

        $account_content
            .append( this.template({
                username: snapr.auth.get( "snapr_user" ),
                user_id: this.user_settings.get( "user" ).user_id,
                settings: this.user_settings.get( "settings" ),
                camplus: {
                    camplus_menu: (snapr.utils.get_local_param( "camplus" ) == "true"),
                    camplus_camera: (snapr.utils.get_local_param( "camplus_camera" ) == "true"),
                    camplus_edit: (snapr.utils.get_local_param( "camplus_edit" ) == "true"),
                    camplus_lightbox: (snapr.utils.get_local_param( "camplus_lightbox" ) == "true"),
                }
            }) )
            .trigger('create');

        // set all linked services to false, we will check them off below

        var linked_services_list = {
            foursquare:false,
            facebook:false,
            tumblr:false,
            twitter:false
        }

        _.each( this.user_settings.get('linked_services'), function( service, index )
        {
            var v = new snapr.views.linked_service();
            v.model = service;

            // keep track of linked services
            linked_services_list[service.provider] = true;

            $account_content.find('.linked-services').append( v.render().el ).trigger('create');
        });

        // for all services that are not yet linked, add
        _.each( linked_services_list, function( val, provider )
        {
            if (val == false)
            {
                var v = new snapr.views.linked_service();
                v.provider = provider;
                $account_content.find('.add-services').append( v.render().el ).trigger('create');
            }
        });

        $account_content.find('.add-services').listview().listview("refresh");

        var hide_connect_heading = _.filter(linked_services_list, function(val){return !val;}).length ? false: true;
        var hide_linked_heading = _.filter(linked_services_list, function(val){return val;}).length ? false: true;
        if (hide_connect_heading)
        {
            this.$el.find(".connect-heading").hide();
        }
        if (hide_linked_heading)
        {
            this.$el.find(".linked-heading").hide();
        }

        return this;
    },

    events: {
        "click .my-account-avatar label": "set_avatar",
        "click .my-account-set-up-gravatar": "set_up_gravatar",
        "click .my-account-notifications .save": "save_notifications",
        "click .my-account-account .save": "save_account",
        "click .my-account-camplus .save": "save_camplus"
    },

    set_avatar: function(e)
    {
        var input_target = $('#' + e.currentTarget.htmlFor);

        var avatar_type = input_target.val();

        var user_setting = new snapr.models.user_settings();

        var container = input_target.closest( ".my-account-avatar" );
        container.find( "input[type='radio']" ).attr( "checked", false );
        input_target.attr( "checked", true );
        container.find( "input[type='radio']" ).checkboxradio( "refresh" );

        // var options = {
        //     success: function()
        //     {
        //         console.log( "set avatar success" );
        //     },
        //     error: function()
        //     {
        //         console.log( "set avatar error" );
        //     }
        // }
        //

        console.log( "set_avatar", avatar_type );
    },

    set_up_gravatar: function()
    {
        window.open( "http://en.gravatar.com/" );
    },

    save_settings: function( param, collapse_container )
    {
        // prevent backbone from thinking this is a new user
        this.user_settings.id = true;

        this.user_settings.save({},{
            data: param,
            success: function( model, xhr )
            {
                if (xhr.success)
                {
                    $(collapse_container).trigger( "collapse" );
                }
                else
                {
                    console.warn( "error saving notifications", xhr );
                }
            },
            error: function( e )
            {
                console.warn( "error saving notifications", e );
            }
        });
    },

    save_notifications: function( e )
    {
        var $collapse = $(e.currentTarget).closest("[data-role='collapsible']");
        var selects = $collapse.find("select");

        var param = {};

        _.each(selects, function(select)
        {
            param[$(select).attr("name")] = ($(select).val() == "true") ? true: false;
        });

        this.save_settings( param, $collapse[0] );
    },

    save_account: function( e )
    {
        var $collapse = $(e.currentTarget).closest("[data-role='collapsible']");

        var param = {};

        var email = this.$el.find("#my-account-email").val();
        var password = this.$el.find("#my-account-password").val();
        var password_verify = this.$el.find("#my-account-password-verify").val();

        this.$el.find("#my-account-password").val("");
        this.$el.find("#my-account-password-verify").val("");

        if (!email)
        {
            snapr.utils.notification("No email", "Please provide an email address", $.noop);
            return;
        }
        else
        {
            if (email != this.user_settings.get("settings") && this.user_settings.get("settings").email)
            {
                param.email = email;
            }
        }
        if (password)
        {
            if (!password_verify)
            {
                snapr.utils.notification("No verification password", "Please enter your password again", $.noop);
                return;
            }
            else if (password != password_verify)
            {
                snapr.utils.notification("Passwords don't match", "Please enter your password again", $.noop);
                return;
            }
            else
            {
                param.password = password;
            }
        }

        if (!_.isEmpty( param ))
        {
            this.save_settings( param, $collapse[0] );
        }
    },

    save_camplus: function( e )
    {
        var $collapse = $(e.currentTarget).closest("[data-role='collapsible']");
        var selects = $collapse.find("select");

        var param = {};

        _.each( selects, function( select )
        {
            var key = $(select).attr("name");
            var value = ($(select).val() == "true") ? true: false
            param[key] = value;
            snapr.utils.save_local_param( key, value )
        });

        $collapse.trigger("collapse");

        if (snapr.utils.get_local_param("appmode") == "iphone")
        {
            pass_data( "snapr://camplus/settings/?" + $.param( param ) );
        }
        else
        {
            console.log( "snapr://camplus/settings/?" + $.param( param ) );
        }
    },

    queue_settings: function( upload_mode, paused )
    {
        this.render();
    }

});


// notifyWhenImageModerated: $('#ntmoderation',form).is(':checked'),
// notifyWhenCommentAdded: $('#ntcomment',form).is(':checked'),
// notifyAfterComment: $('#ntafter_comment',form).is(':checked'),
// notifyWhenImageFavorited: $('#ntfav',form).is(':checked'),
// notifyWhenAddedToGroup: $('#ntfollow',form).is(':checked'),
// subscribeToEmailNewsletter: $('#ntnewsupdates',form).is(':checked')
