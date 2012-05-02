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
        var keywords = $("#dash-search-keywords").val(),
            nearby = $("#dash-search-type").val(),

            stream = new snapr.models.dash_stream({
                query: {
                    keywords: keywords,
                    nearby: !!nearby,
                    radius: nearby || null
                },
                display: {
                    "title": "Search for "+keywords,
                    "short_title": keywords,
                    "type": "search"
                }
            });
        stream.save({}, {success: function(){
                dash.add(stream);
            }});
        this.back();
    }

});
