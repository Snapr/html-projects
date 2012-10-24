/*global _  define require */
define(['views/base/page', 'models/comp', 'views/base/side_scroll'],
function(page_view, comp, side_scroll ){

var comp_view = page_view.extend({

    post_initialize: function() {
        $.mobile.showPageLoadingMsg();

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
        var view = this,
            new_el,
            image_streams,
            award_stream;

        new_el = $(this.template(
            _.extend(
                { initial: false },
                this.model.attributes
            )
        ));

        this.$('[data-role=content]').empty().append(new_el.find('[data-role=content]').children()).trigger( "create" );

        //award_stream = this.$('.award-stream');

        image_streams = this.$('.x-s-image-streams');

        _.each(this.model.get('streams'), function (stream) {
            var li = new side_scroll({
                data: stream,
                initial_title: 'Popular',
                expand: true,
                parent_view: view
            });
            image_streams.append( li.el );
            li.render();
        });

        image_streams.trigger('create');

        // _.each(this.model.get('awards'), function (award) {
        //     var li = new award_stream({
        //         model: award
        //     });
        //     container.append( li.render().el );
        // });
        // container.trigger('create');

        $.mobile.hidePageLoadingMsg();

    }
});

var award_stream = side_scroll.extend({

    tagName: 'li',

    className: 'award-stream',

    // get_title: function(){
    //     var title = this.model.get("display").short_title;
    //     if(this.model.get("query").username){
    //         title = title.replace(this.model.get("query").username, '<span class="at">@</span>' + this.model.get("query").username);
    //     }
    //     if(this.model.get("query").keywords){
    //         title = title.replace(this.model.get("query").keywords, '<span class="hash">#</span>' + this.model.get("query").keywords);
    //     }
    //     if(this.model.get("query").radius){
    //         title = title +  ' <span class="radius">(' + this.model.get("query").radius/1000 +'km)</span>';
    //     }
    //     return title;
    // },

    post_initialize: function( options ){
        this.$el.attr('data-id', this.model.id);
    }
});

return comp_view;

});
