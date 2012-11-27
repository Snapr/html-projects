/*global _  define require T */
define(['views/base/page', 'models/comp', 'views/base/side_scroll', 'views/base/award_scroll'],
function(page_view, comp, side_scroll, award_scroll ){

var comp_view = page_view.extend({

    post_initialize: function() {
        $.mobile.showPageLoadingMsg();

        this.rendered = false;

        this.model = new comp({id:this.options.query.id});
        this.model.fetch({
            data:{detail:2},
            success: this.render
        });
    },

    post_activate: function(options) {
        this.change_page();
    },

    events: {
    },

    render: function() {
        var new_el,
            image_streams,
            award_stream;

        new_el = $(this.template(
            _.extend(
                { initial: false },
                this.model.attributes
            )
        ));

        this.$('[data-role=content]').empty().append(new_el.find('[data-role=content]').children()).trigger( "create" );

        award_scroll = new award_scroll({
            collection: this.model.get('awards')
        });

        this.$('.x-award-stream').append(award_scroll.el);
        award_scroll.render();

        image_streams = this.$('.x-image-streams');

        _.each(this.model.get('streams'), function (stream) {
            var li = new side_scroll({
                data: stream,
                initial_title: T('Popular'),
                expand: true
            });
            image_streams.append( li.el );
            li.render();
        });

        image_streams.trigger('create');

        $.mobile.hidePageLoadingMsg();
        this.rendered = true;
        return this;
    }
});

var award_stream = side_scroll.extend({

    tagName: 'li',

    className: 'award-stream',



    post_initialize: function( options ){
        this.$el.attr('data-id', this.model.id);
    }
});

return comp_view;

});
