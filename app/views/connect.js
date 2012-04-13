snapr.views.connect = snapr.views.page.extend({

    initialize: function()
    {
        snapr.views.page.prototype.initialize.call( this );

        this.change_page();

        var query = new Query(this.options.query),
            linked = query.pop('linked');

        this.photo_id = query.get('photo_id');

        // if there is a newly linked service, share to it then carry on linking (or finish)
        if (linked)
        {
            username = query.pop('username');
            // is a service username is suppllied
            if (username)
            {
                link = this.link;
                this.share(linked, function(){link(query);});
            // no service username = something went wrong
            }
            else
            {
                alert( query.get('error', 'Unknown Error Linking') );
            }
        // if there are no newly linked services carry on linking (or finish) stright away
        }
        else
        {
            this.link( query );
        }

    },

    link: function( query )
    {
        var to_link = query.get('to_link') ? query.get('to_link').split(','): [];
        var service = to_link.shift();
        if (service)
        {
            query.set('linked', service).set('to_link', to_link.join(','));
            var next = window.location.href.split('?')[0];
            next += '?' + query.toString();
            var url;
            if (snapr.utils.get_local_param( "appmode" )){
                url = snapr.api_base + "/linked_services/"+ service + "/oauth/?access_token=" + snapr.auth.get("access_token") +
                    "&redirect=snapr://redirect?url=" + escape( next );
            }else{
                url = snapr.api_base + "/linked_services/" + service + "/oauth/?access_token=" + snapr.auth.get("access_token") +
                    "&redirect=" + escape( next );
            }
            window.location = url;
        }
        else
        {
            setTimeout( function()
            {
                Route.navigate("#/uploading/?shared=true&photo_id=" + query.get('photo_id'), true);
            }, 600);
        }
    },

    share: function( service, callback )
    {
        this.model = new snapr.models.photo({id: this.photo_id});

        var options = {
            success: callback,
            error: function( error ){
                console.log("share error", error);
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
    },

});
