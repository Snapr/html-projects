snapr.views.feed_list = Backbone.View.extend({

    tagName: "ul",

    className: "gallery",

    initialize: function()
    {
        _.bindAll( this );

        this.li_templates = {
            list: _.template( $("#feed-li-list-template").html() ),
            grid: _.template( $("#feed-li-grid-template").html() ),
        }

        this.list_style = this.options.list_style || 'list';

        this.list_content = [];
        // console.log( "feed list list_style", init_options, init_options.list_style, this.list_style );

    },

    render: function( callback )
    {
        var feed_list = this;

        // console.log( "render", feed_list );

        feed_list.el.empty();

        _.each( this.collection.models, function( item )
        {
            var li = new snapr.views.feed_li({
                model: item,
                template: feed_list.li_templates[feed_list.list_style]
            });
            $(this.el).append( li.render().el );
        }, this);

        $img = $(this.el).find("img");
        $img.load(function(){
            $img.css("height","auto");
        });

        // create jquery mobile markup, set to listview and refresh

        $(this.el)
            .trigger("create");

        $(this.el)
            .removeClass('thumbs-grid-med')

        if(callback && typeof callback == 'function'){
            callback();
        }

        return this;
    }
})
