/*global _ Route define require */
define(['views/base/dialog', 'models/user'], function(dialog_view, user_model){

return dialog_view.extend({

    post_initialize: function(){
        this.template = _.template( $("#user-profile-template").html() );
    },

    activate: function(){

        this.$el.find( ".user-profile" ).empty();

        this.model = new user_model( {username: this.options.query.username} );
        this.model.bind( "change", _.bind(this.render, this) );

        // if we are coming from the map view do a flip, otherwise do a slide transition
        var transition = ($.mobile.activePage.attr('id') == 'map') ? "flip" : "slideup";
        this.change_page({
            transition: transition
        });

        this.model.fetch();
    },

    render: function(){
        this.$el.find( ".user-profile" ).html( this.template({
            user: this.model
        }) );
        this.$el.trigger( "create" );
    }
});
});
