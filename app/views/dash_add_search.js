snapr.views.dash_add_search = snapr.views.dialog.extend({

    initialize: function()
    {
        snapr.views.dialog.prototype.initialize.call( this );

        this.change_page({
            transition: this.transition
        });
    },

    events: {
        "submit #search-form": "search",
        "click .x-back": "back"
    },

    search: function()
    {
        var keywords = $("#dash-search-keywords").val();
        var nearby = $("#dash-search-type").val();

        var stream_object = {
            query: {
                keywords: keywords,
                nearby: !!nearby,
            },
            display: {
                "title": "Search for "+keywords,
                "short_title": keywords,
                "type": "search"
            }
        }

        if (nearby)
        {
            stream_object.query.radius = nearby;
        }

        var stream = new snapr.models.dash_stream( stream_object );
        stream.save({}, {success: function(){
            dash.add(stream);
        }});
        this.back_view.$el.removeClass('edit');
        this.back();
    }

});
