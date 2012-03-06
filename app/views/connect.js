snapr.views.connect = Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );
        this.el.live('pagehide', function( e )
        {
            $(e.target).undelegate();

            return true;
        });

        $.mobile.changePage( $("#connect"), {
            changeHash: false
        });

        this.photo_id = this.options.query && this.options.query.photo_id || null;
        this.to_link = this.options.query && this.options.query.to_link && this.options.query.to_link.split(",") || [];
        this.shared = this.options.query && this.options.query.shared && this.options.query.shared.split(",") || [];
        this.to_share = [];
        if (this.to_link.length && this.options.query && this.options.query.url)
        {
            _.each(this.to_link, function(service)
            {
                // is the service provider mentioned in the return url?
                if (this.options.query.url.indexOf(service) > -1)
                {
                    this.to_link = _.without(this.to_link, service);

                    this.to_share.push( service );
                }
            }, this);
        }

        this.services = [
            "facebook",
            "tumblr",
            "foursquare",
            "twitter"
        ];

        this.render();
        // this.user_settings = new snapr.models.user_settings();
        //
        // var connect_view = this;
        // var options = {
        //     success: function()
        //     {
        //         connect_view.user_settings.linked_services_setup();
        //         connect_view.render();
        //     },
        //     error: function()
        //     {
        //         console.warn( 'error');
        //     }
        // }
        //
        // this.user_settings.fetch(options);
    },

    render: function()
    {
        $(this.el).find("ul").empty();

        _.each(this.services, function( service )
        {
            if (_.indexOf( this.to_share, service ) > -1)
            {
                // this service has been linked and can now share
                // the li will do the sharing itself and redirect
                // when ready
                var li = new snapr.views.connect_li({
                    provider: service,
                    status: "ready",
                    photo_id: this.photo_id,
                    parent_view: this
                });
                $(this.el).find("ul").append( li.render().el );
            }
            else if (_.indexOf( this.to_link, service ) > -1)
            {
                // this service was not linked
                var li = new snapr.views.connect_li({
                    provider: service,
                    status: "unlinked",
                    photo_id: this.photo_id,
                    parent_view: this
                });
                $(this.el).find("ul").append( li.render().el );
            }
            else if (_.indexOf( this.shared, service ) > -1)
            {
                // this service was shared
                var li = new snapr.views.connect_li({
                    provider: service,
                    status: "shared",
                    photo_id: this.photo_id,
                    parent_view: this
                });
                $(this.el).find("ul").append( li.render().el );
            }


        }, this);

        $(this.el).find("ul").trigger('create').listview().listview("refresh");
        console.warn( "render connect", this );
        // $(this.el).trigger("refresh");

        return this;
    }

});