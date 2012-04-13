snapr.views.my_account = snapr.views.page.extend({

    initialize:function()
    {
        snapr.views.page.prototype.initialize.call( this );

        this.change_page();

        this.user_settings = new snapr.models.user_settings();

        var my_account_view = this;
        var options = {
            success: function()
            {
                my_account_view.user_settings.linked_services_setup();
                my_account_view.render();
            },
            error: function()
            {
                console.log( 'error' , my_account_view );
            }
        }
        this.user_settings.fetch( options );
    },

    template: _.template( $('#my-account-template').html() ),

    render: function()
    {
        var $account_content = this.$el.find('.account-content').empty();

        if (snapr.utils.get_local_param("appmode"))
        {
            this.upload_settings = new snapr.views.upload_settings();
            $account_content.prepend( this.upload_settings.render().el );
        }

        $account_content
            .append( this.template({
                username: snapr.auth.get( "snapr_user" ),
                settings: this.user_settings.get('settings')
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

        return this;
    },

    events: {
        "click .my-account-avatar label": "set_avatar",
        "click .my-account-set-up-gravatar": "set_up_gravatar",
        "click .my-account-save": "save_settings"
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

    save_settings: function()
    {
        console.log( "save settings" );
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
