/*global _  define require */
define(['views/base/page', 'collections/comp'],
function(page_view, comps ){

var comp_view = page_view.extend({

    post_initialize: function() {
    },

    post_activate: function(options) {
        this.change_page();

        $.mobile.showPageLoadingMsg();

        this.collection = new comps();
        this.collection.fetch({
            success: this.render
        });
    },

    events: {
    },

    render: function() {
        var new_el = $(this.template({
            initial: false,
            comps: this.collection.models
        }));

        this.$('[data-role=content]').empty().append(new_el.find('[data-role=content]').children()).trigger( "create" );

        $.mobile.hidePageLoadingMsg();

    }
});

return comp_view;

});
