snapr.views.popular = snapr.views.page.extend({

    events: {
        "click #popular-timeframe a":"update_list"
    },

    initialize: function()
    {
        snapr.views.page.prototype.initialize.call( this );

        this.change_page();

        this.photo_collection = new snapr.models.photo_collection();
        this.photo_collection.url = snapr.api_base + "/search/";
        this.photo_collection.data = {
            sort:"favorite_count",
            n:20
        };

        this.list_view = new snapr.views.thumbs_li({
            collection: this.photo_collection,
            el: $('#popular-thumbs'),
            back: "Popular"
        });

        this.time_period = null;

        this.update_list();
    },

    update_time_buttons: function()
    {
        this.$el.find( "#popular-timeframe a" ).removeClass( "ui-btn-active" );

        switch (this.time_period)
        {
            case 'time-today':
                this.$el.find( "#popular-time-today" ).addClass( "ui-btn-active" );
                break;
            case 'time-week':
                this.$el.find( "#popular-time-week" ).addClass( "ui-btn-active" );
                break;
            case 'time-all':
                this.$el.find( "#popular-time-all" ).addClass( "ui-btn-active" );
                break;
        }
    },

    update_list: function( e )
    {
        if (e && e.currentTarget)
        {
            this.time_period = e.currentTarget.id.replace( 'popular-', '' );
            snapr.utils.save_local_param( "popular-time", this.time_period );
        }
        else
        {
            this.time_period = snapr.utils.get_local_param( "popular-time" ) || 'time-all';
        }

        switch (this.time_period)
        {
            case 'time-today':
                var today = new Date();
                this.photo_collection.data.min_date = snapr.utils.date_to_snapr_format( today );
                break;
            case 'time-week':
                var day = new Date();
                day.setMilliseconds( day.getMilliseconds() - (7*24*60*60*1000) );
                this.photo_collection.data.min_date = snapr.utils.date_to_snapr_format( day );
                break;
            case 'time-all':
                if (this.photo_collection.data.min_date)
                {
                    delete this.photo_collection.data.min_date;
                }
        }

        var popular_view = this;

        var options = {
            success: function()
            {
                // store the last query
                $('#popular-thumbs').data('query', {
                    time: popular_view.time_period,
                    auth: snapr.auth.attributes
                });
            },
            error: function( e )
            {
                console.log( "error fetching popular photos", e );
                $.mobile.hidePageLoadingMsg();
            }
        };

        this.update_time_buttons();

        // only update list if the query has changed or the user clicked on a button
        if (!_.isEqual( $('#popular-thumbs').data('query'), {time: this.time_period, auth: snapr.auth.attributes} ) || e)
        {
            $.mobile.showPageLoadingMsg();
            this.photo_collection.fetch( options );
        }
    }
});
