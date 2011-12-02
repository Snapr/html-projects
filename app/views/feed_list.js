tripmapper.views.feed_list = Backbone.View.extend({

    initialize: function( init_options )
    {
        this.li_templates = {
            list: _.template( $("#feed-li-list-template").html() ),
            grid: _.template( $("#feed-li-grid-template").html() ),
        }

        this.view_style = init_options.view_style || 'list';
    
    },

    render: function( callback )
    {
        var feed_list = this;
        
        console.warn( "render", feed_list );
        
        feed_list.el.empty();
        
        _.each( this.collection.models, function( item )
        {
            var li = new tripmapper.views.feed_li({
                model: item,
                template: feed_list.li_templates[feed_list.view_style]
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
            feed_list.el.append( li.render().el );
        });
        // create jquery mobile markup, set to listview and refresh
        
        feed_list.el.trigger("create");
        
        if (feed_list.view_style == 'list')
        {
            feed_list.el
                .removeClass('grid-list')
                .listview()
                .listview("refresh");
        }
        else
        {
            feed_list.el.addClass('grid-list');
        }

        if(callback && typeof callback == 'function'){
            callback();
        }
        
        return this;
    }
})