/*global _ Route define require */
define(['views/base/dialog', 'models/user'], function(dialog_view, user_model){

return dialog_view.extend({

    post_initialize: function(){

        this.$el.find( ".user-profile" ).empty();

        this.model = new user_model( {username: this.options.query.username} );

        this.template = _.template( $("#user-profile-template").html() );

        this.model.bind( "change", function(){this.render();} );

        // if we are coming from the map view do a flip, otherwise do a slide transition
        var transition;
        if ($.mobile.activePage.attr('id') == 'map'){
            transition = "flip";
        }else{
            transition = "slideup";
        }

        this.change_page({
            transition: transition
        });

        this.model.fetch();
    },

    events: {
        "click .x-back": "back"
    },

    render: function(){
        console.log(this);
        this.$el.find( ".user-profile" ).html( this.template({
            user: this.model
        }) );
        this.$el.trigger( "create" );
    }
});
});
