/*global _  define require */
define(['backbone', 'views/base/page', 'views/linked_service', 'models/post', 'models/photo', 'utils/query', 'utils/alerts'],
    function(Backbone, page_view, linked_service, post_model, photo_model, Query, alerts){
var connect_page = page_view.extend({

    post_activate: function(options){

        this.change_page();

        this.query = new Query(options.query);

        this.linked = this.query.pop('linked');
        this.photo_id = this.query.get('photo_id');
        this.shared = this.query.get('shared') ? this.query.get('shared').split(','): [];
        this.to_link = this.query.get('to_link') ? this.query.get('to_link').split(','): [];
        this.redirect_url = this.query.get('redirect_url') || "#/";  //  = "/"

        this.render();

    },

    events: {
        "click .x-close": "close"
    },

    render: function(){
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
                    alerts.notification('Error Linking', this.query.get('error', 'Unknown Error') );
                }
            }else if(_.contains(this.shared, provider)){
                status = 'shared';
            }else{
                return;  // we don't need to deal with this service
            }

            var li = new connect_li({
                    provider: provider,
                    status: status,
                    photo_id: this.photo_id,
                    parent_view: this
                });
            this.$el.find("ul").append( li.render().el );

        }, this );

        this.$el.find("ul").listview().listview("refresh");
        $.mobile.hidePageLoadingMsg();

    },

    share: function( service ){

        var connect_view = this;

        var options = {
            success: function(){
                if(!connect_view.to_link.length){
                    Backbone.history.navigate( unescape(connect_view.redirect_url) );
                }
                connect_view.linked = null;
                connect_view.shared.push(service);
                connect_view.render();
            },
            error: function( error ){
                console.error("share error", error);
            }
        };

        this.model = new post_model({provider: service, photo_id: this.photo_id});
        this.model.save({}, options);
    },

    close: function(e){
        Backbone.history.navigate( unescape(this.redirect_url) );
        e.preventDefault();
    }

});

var connect_li = linked_service.extend({

    initialize: function(){
        _.bindAll( this );
        this.template = _.template( $("#connect-li-template").html() );
        this.provider = this.options.provider || null;
        this.status = this.options.status || null;
        this.photo_id = this.options.photo_id || null;
        this.parent_view = this.options.parent_view || null;
    },

    render: function(){
        this.$el
            .attr("data-role", "fieldcontain")
            .addClass(this.status)
            .html( this.template({
                provider: this.provider,
                status: this.status
            }))
            .trigger("create");

        return this;
    },

    events: {
        "submit .tumblr-login": "link_service",
        "click": "link_service"
    },

    get_return_url: function(){
        var to_link = _.without( this.parent_view.to_link, this.provider );
        var shared = _.without( this.parent_view.shared, this.provider );

        var redirect_params = {linked: this.provider, redirect_url: this.parent_view.redirect_url};

        if (shared.length){
            redirect_params.shared = shared.join(",");
        }
        if (this.photo_id){
            redirect_params.photo_id = this.photo_id;
        }
        if (to_link.length){
            redirect_params.to_link = to_link.join(",");
        }

        var next = window.location.href.split('?')[0];
        next += "?" + $.param( redirect_params );
        return next;
    }

    // link_service inherited from views/linked_service, uses this.get_return_url
    // link_service: function(){},

});

return connect_page;

});
