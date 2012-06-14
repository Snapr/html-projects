/*global _ Route define require */
define(['backbone', 'views/feed_li', 'views/components/no_results'], function(Backbone, feed_li, no_results){
return Backbone.View.extend({

    initialize: function(){
        _.bindAll( this );

        this.collection.bind( "remove", this.render );

        this.setElement( this.options.el );

        this.li_templates = {
            list: _.template( $("#feed-li-list-template").html() ),
            grid: _.template( $("#feed-li-grid-template").html() )
        };

        this.list_style = this.options.list_style || 'list';

        this.back = this.options.back || "Back";

        this.list_content = [];

    },

    render: function( callback ){
        var scrollY = window.scrollY;
        this.$el.empty();

        if(this.collection.length){
            _.each( this.collection.models, function( item ){
                var li = new feed_li({
                    model: item,
                    template: this.li_templates[ this.list_style ],
                    back: this.back
                });
                this.$el.append( li.render().el );
            }, this);

            if(this.list_style == 'list'){
                this.$el.find("img").each(function()
                {
                    var $img = $(this);
                    $img.load(function(){
                        $(this).css("height","auto");
                    });
                });
            }
        }else{
            no_results.render('No Photos', 'delete').$el.appendTo(this.$el);
        }

        // create jquery mobile markup, set to listview and refresh

        this.$el.trigger("create");

        // what's this for?
        this.$el.removeClass('thumbs-grid-med');


        if (scrollY){
            window.scrollTo(0, scrollY);
        }

        if (callback && typeof callback == 'function'){
            callback();
        }

        return this;
    }
});
});
