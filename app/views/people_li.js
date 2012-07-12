/*global _  define require */
define(['backbone', 'auth'], function(Backbone, auth){
return Backbone.View.extend({

    initialize: function(){
        _.bindAll( this);
        this.template = this.options.template;

        this.model.bind( "change", this.refresh );
    },

    tagName: 'li',

    render: function(){
        this.$el
            .html( this.template({
                user: this.model,
                auth_username: auth.get( "snapr_user" ),
                logged_in: auth.has( "access_token" )
            }) );

        return this;
    },

    refresh: function(){
       
        this.$el.find(".photo-count").text( this.model.get("photo_count") );
    },

});
});
