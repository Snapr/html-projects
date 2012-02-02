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
        // console.warn( "feed list list_style", init_options, init_options.list_style, this.list_style );

    },

    render: function( callback )
    {
        var feed_list = this;

        // console.warn( "render", feed_list );

        feed_list.el.empty();

        _.each( this.collection.models, function( item )
        {
            var li = new snapr.views.feed_li({
                model: item,
                template: feed_list.li_templates[feed_list.list_style]
            });
            li.model.bind( 'change:comments', function()
            {
                li.update_counts();
            });
            li.model.bind( 'change:favorite', function()
            {
                li.update_fav();
                li.update_counts();
            });
            $(this.el).append( li.render().el );
        }, this);

        $imgs = $(this.el).find("img");
        $imgs.load(function(){
            $imgs.css("height","auto");
        })


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