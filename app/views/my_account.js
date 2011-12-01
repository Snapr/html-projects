tripmapper.views.my_account = Backbone.View.extend({

    

    initialize:function()
    {
        $.mobile.changePage( $("#my-account"), {changeHash: false} );
        this.user_settings = new tripmapper.models.user_settings();
        var my_account_view = this;
        var options = {
            success: function()
            {
                my_account_view.user_settings.linked_services_setup();
                // console.warn( 'success', my_account_view.user_settings );
                // console.warn( 'linked_services', my_account_view.user_settings.get('linked_services') );
                my_account_view.render();
            },
            error: function()
            {
                console.warn('error',my_account_view);
            }
        }
        this.user_settings.fetch( options );
    },
    
    template: _.template( $('#my-account-template').html() ),
    
    render: function()
    {
        // console.warn( 'render my-account', this.el.find('[data-role="content"]') );
        var account_content = this.el.find('[data-role="content"]');
        account_content
            .empty()
            .append( this.template({
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
            var v = new tripmapper.views.linked_service();
            v.model = service;
            
            // keep track of linked services
            linked_services_list[service.provider] = true;
            
            account_content.find('.linked-services').append( v.render().el ).trigger('create');
        });

        // for all services that are not yet linked, add
        _.each( linked_services_list, function( val, provider )
        {
            if (val == false)
            {
                var v = new tripmapper.views.linked_service();
                v.provider = provider;
                account_content.find('.add-services').append( v.render().el ).trigger('create');
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
        
        var user_setting = new tripmapper.models.user_settings();
        
        var container = input_target.closest( ".my-account-avatar" );
        container.find( "input[type='radio']" ).attr( "checked", false );
        input_target.attr( "checked", true );
        container.find( "input[type='radio']" ).checkboxradio( "refresh" );
        
        // var options = {
        //     success: function()
        //     {
        //         console.warn( "set avatar success" );
        //     },
        //     error: function()
        //     {
        //         console.warn( "set avatar error" );
        //     }
        // }
        // 
        
        console.warn( "set_avatar", avatar_type );
    },
    
    set_up_gravatar: function()
    {
        window.open( "http://en.gravatar.com/" );
    },
    
    save_settings: function()
    {
        console.warn( "save settings" );
    }

});


// notifyWhenImageModerated: $('#ntmoderation',form).is(':checked'),
// notifyWhenCommentAdded: $('#ntcomment',form).is(':checked'),
// notifyAfterComment: $('#ntafter_comment',form).is(':checked'),
// notifyWhenImageFavorited: $('#ntfav',form).is(':checked'),
// notifyWhenAddedToGroup: $('#ntfollow',form).is(':checked'),
// subscribeToEmailNewsletter: $('#ntnewsupdates',form).is(':checked')
