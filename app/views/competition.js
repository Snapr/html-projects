/*global _  define require */
define(['views/base/page', 'models/comp'],
function(page_view, comp ){

var comp_view = page_view.extend({

    post_initialize: function() {
    },

    post_activate: function(options) {
        this.change_page();

        $.mobile.showPageLoadingMsg();

        this.model = new comp({id:this.options.query.id});
        this.model.fetch({
            data:{detail:2},
            success: this.render
        });
    },

    events: {
    },

    render: function() {
        var new_el = $(this.template(
            _.extend(
                { initial: false },
                this.model.attributes
            )
        ));

        this.$('[data-role=content]').empty().append(new_el.find('[data-role=content]').children()).trigger( "create" );

        $.mobile.hidePageLoadingMsg();

    }
});

return comp_view;

});
