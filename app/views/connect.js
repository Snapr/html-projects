snapr.views.connect = snapr.views.page.extend({

    initialize: function()
    {
        snapr.views.page.prototype.initialize.call( this );

        this.change_page();

        this.query = new Query(this.options.query);

        this.linked = this.query.pop('linked');
        this.photo_id = this.query.get('photo_id');
        this.shared = this.query.get('shared') ? this.query.get('shared').split(','): [];
        this.to_link = this.query.get('to_link') ? this.query.get('to_link').split(','): [];

        this.render();

    },

    render: function()
    {
        this.$el.find("ul").empty();

        _.each( this.to_link, function( provider )
        {
            var li = new snapr.views.connect_li({
                provider: provider,
                status: "unlinked",
                photo_id: this.photo_id,
                parent_view: this
            });
            this.$el.find("ul").append( li.render().el );
        }, this);

        if(this.linked){
            // is a service username is suppllied
            if (this.query.get('username')){

                var li = new snapr.views.connect_li({
                    provider: this.linked,
                    status: "ready",
                    photo_id: this.photo_id,
                    parent_view: this
                });
                this.$el.find("ul").append( li.render().el );

                this.share(this.linked);

            // no service username = something went wrong
            }else{
                alert( this.query.get('error', 'Unknown Error Linking') );
            }
        }

        _.each( this.shared, function( provider )
        {
            var li = new snapr.views.connect_li({
                provider: provider,
                status: "shared",
                photo_id: this.photo_id,
                parent_view: this
            });
            this.$el.find("ul").append( li.render().el );
        }, this);

        this.$el.find("ul").listview().listview("refresh");

        // if (service)
        // {
        //     query.set('linked', service).set('to_link', to_link.join(','));
        //     var next = window.location.href.split('?')[0];
        //     next += '?' + query.toString();
        //     var url;
        //     if (snapr.utils.get_local_param( "appmode" )){
        //         url = snapr.api_base + "/linked_services/"+ service + "/oauth/?access_token=" + snapr.auth.get("access_token") +
        //             "&redirect=snapr://redirect?url=" + escape( next );
        //     }else{
        //         url = snapr.api_base + "/linked_services/" + service + "/oauth/?access_token=" + snapr.auth.get("access_token") +
        //             "&redirect=" + escape( next );
        //     }
        //     // window.location = url;
        // }
        // else
        // {
        //     setTimeout( function()
        //     {
        //         Route.navigate("#/uploading/?shared=true&photo_id=" + query.get('photo_id'));
        //     }, 600);
        // }
    },

    share: function( service )
    {
        this.model = new snapr.models.photo({id: this.photo_id});

        var connect_view = this;

        var options = {
            success: function(){
                connect_view.linked = null;
                connect_view.shared.push(service);
                connect_view.render();
            },
            error: function( error ){
                console.error("share error", error);
            }
        };

        switch (service){
            case "facebook":
                this.model.save({
                    facebook_feed: true
                }, options);
                break;
            case "tumblr":
                this.model.save({
                    tumblr: true
                }, options);
                break;
            case "twitter":
                this.model.save({
                    tweet: true
                }, options);
                break;
            case "foursquare":
                this.model.save({
                    foursquare_checkin: true
                }, options);
                break;
        }
    }

});
