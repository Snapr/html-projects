/*global _  define require */
define(['views/base/page', 'models/user'], function(page_view, user_model){

return page_view.extend({

    post_initialize: function(){
        this.template = _.template( $("#user-profile-template").html() );
    },

    post_activate: function(){

        this.$el.find( ".user-profile" ).empty();

        this.model = new user_model( {username: this.options.query.username} );
        this.model.bind( "change", _.bind(this.render, this) );

        this.change_page();

        this.model.fetch();
    },

    render: function(){
        this.$el.find( ".user-profile" ).html( this.template({
            user: this.model
        }) );
        this.$el.trigger( "create" );
    },

    transition: "slideup"
});
});
