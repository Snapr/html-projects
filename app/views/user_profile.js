/*global _  define require */
define(['views/base/page', 'models/user'], function(page_view, user_model){

return page_view.extend({

    create_page: function(){
        this.setElement($(this.template({initial:true})));
        this.$el.appendTo(document.body);
    },

    post_activate: function(options){

        this.$el.find( ".user-profile" ).empty();

        this.model = new user_model( {username: options.query.username} );
        this.model.bind( "change", _.bind(this.render, this) );

        this.change_page();

        this.model.fetch();
    },

    render: function(){
        var rendered = $(this.template({
            initial:false,
            user: this.model
        }));
        this.$( ".user-profile" ).replaceWith(rendered.find(".user-profile"));
        this.$el.trigger( "create" );
    }
});
});
