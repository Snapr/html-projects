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
        this.redirect_url = this.query.get('redirect_url');

        this.render();

    },

    render: function()
    {
        this.$el.find("ul").empty();

        _.each( [ 'twitter', 'facebook', 'tumblr', 'foursquare'], function( provider ){
            var status;
            if(_.contains(this.to_link, provider)){
                status = 'unlinked';
            }else if(provider == this.linked){
                // is a service username is suppllied
                if (this.query.get('username')){
                    status = 'ready';
                    this.share(this.linked);
                // no service username = something went wrong
                }else{
                    status = 'error';
                    alert( this.query.get('error', 'Unknown Error Linking') );
                }
            }else if(_.contains(this.shared, provider)){
                status = 'shared';
            }else{
                return;  // we don't need to deal with this service
            }

            var li = new snapr.views.connect_li({
                    provider: provider,
                    status: status,
                    photo_id: this.photo_id,
                    parent_view: this
                });
            this.$el.find("ul").append( li.render().el );

        }, this );

        this.$el.find("ul").listview().listview("refresh");

    },

    share: function( service )
    {
        //this.model = new snapr.models.photo({id: this.photo_id});

        var connect_view = this;

        var options = {
            success: function(){
                if(!connect_view.to_link.length){
                    Route.navigate( unescape(connect_view.redirect_url) );
                }
                connect_view.linked = null;
                connect_view.shared.push(service);
                connect_view.render();
            },
            error: function( error ){
                console.error("share error", error);
            }
        };

        this.model = new snapr.models.post({provider: service, photo_id: this.photo_id});
        this.model.save({}, options);
    }

});
