snapr.views.dash_add_search = snapr.views.dialog.extend({

    initialize: function()
    {
        snapr.views.dialog.prototype.initialize.call( this );
        this.$el.find(".ui-input-text").val('');

        this.change_page({
            transition: this.transition
        });

        var dialog = this;
        this.$el.live( "pageshow", function( e, ui )
        {
            dialog.$('#dash-search-keywords').focus();
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
                nearby: !!nearby
            },
            display: {
                "title": "Search for "+keywords,
                "short_title": keywords,
                "type": "search"
            }
        };

        if (nearby)
        {
            var add_search = this;
            stream_object.query.radius = nearby;

            var success_callback = function( position )
            {
                stream_object.query.latitude = position.coords.latitude;
                stream_object.query.longitude = position.coords.longitude;

                var stream = new snapr.models.dash_stream( stream_object );
                $.mobile.showPageLoadingMsg();
                stream.save({}, {success: function(){
                    dash.add(stream);
                    $.mobile.hidePageLoadingMsg();
                }});
                add_search.back_view.$el.removeClass('edit');
                add_search.back();
            }
            var error_callback = function( error )
            {
                console.warn( "error getting geolocation", error );
                if (error.message)
                {
                    snapr.utils.notification( error.message );
                }
            }
            snapr.geo.get_location( success_callback, error_callback );
        }
        else
        {
            var stream = new snapr.models.dash_stream( stream_object );
            $.mobile.showPageLoadingMsg();
            stream.save({}, {success: function(){
                dash.add(stream);
                $.mobile.hidePageLoadingMsg();
            }});
            this.back_view.$el.removeClass('edit');
            this.back();
        }

    }

});
