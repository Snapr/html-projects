snapr.views.linked_services = Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );
        this.el.live('pagehide', function( e )
        {
            $(e.target).undelegate();

            return true;
        });

        $.mobile.changePage( $("#linked-services"), {
            changeHash: false,
            transition: "slidedown"
        });
        
        if(this.options.query.to_link){
            this.to_link = this.options.query.to_link.split(",");
            this.still_to_link = this.to_link;
        }else{
            this.still_to_link = [];
        }

        this.user_settings = new snapr.models.user_settings();
        // this.user_settings.bind( "change:linked_services", this.render);

        var linked_services_view = this;
        var options = {
            success: function()
            {
                linked_services_view.user_settings.linked_services_setup();
                linked_services_view.render();
            },
            error: function()
            {
                console.warn( 'error');
            }
        }

        this.user_settings.fetch(options);
    },
    
    render: function()
    {
        console.warn('render')

        this.show_tolink_message();

        var linked_services_list = {
            // foursquare:false,
            facebook:false,
            tumblr:false,
            // twitter:false
        }
        
        $(this.el).find('.linked-services').empty();
        $(this.el).find('.add-services').empty();
                
        _.each( this.user_settings.get('linked_services'), function( service, index )
        {
            var v = new snapr.views.linked_service({model: service});
            
            // keep track of linked services
            linked_services_list[service.provider] = true;
            
            $(this.el).find('.linked-services').append( v.render().el ).trigger('create');
        }, this);

        // for all services that are not yet linked, add
        _.each( linked_services_list, function( val, provider )
        {
            if (val == false)
            {
                var v = new snapr.views.linked_service();
                v.provider = provider;
                $(this.el).find('.add-services').append( v.render().el ).trigger('create');
            }
        }, this);
        
        console.warn('end linked_services_list', linked_services_list);
        
        return this;
        
    },
    
    show_tolink_message: function()
    {
        if (this.to_link && this.to_link.length)
        {
            if (this.to_link.length == 1)
            {
                $(this.el).find(".tolink-message").text(
                    'Sharing to ' + this.to_link[0] + ' failed. Please connect this service.')
            }
            if (this.to_link.length > 1)
            {
                $(this.el).find(".tolink-message").text(
                    'Sharing to services: ' + this.to_link.human_list() + ' failed. Please connect these services.')
            }
        }
        else
        {
            $(this.el).find(".tolink-message").text("");
        }
        
    }
    
    
});