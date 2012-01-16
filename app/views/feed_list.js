snapr.views.feed_list = Backbone.View.extend({

    initialize: function( init_options )
    {
        this.li_templates = {
            list: _.template( $("#feed-li-list-template").html() ),
            pink: _.template( $("#feed-li-list-pink-template").html() )
        }

        this.list_style = init_options.list_style || 'list';

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
            feed_list.el.append( li.render().el );
        });
        // create jquery mobile markup, set to listview and refresh
        
        feed_list.el.trigger("create");
        
        feed_list.el
            .removeClass('grid-list')
            .addClass('ui-listview')
            .listview()
            .listview("refresh");

        if(callback && typeof callback == 'function'){
            callback();
        }
        
        return this;
    }
})