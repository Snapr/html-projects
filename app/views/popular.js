tripmapper.views.popular = Backbone.View.extend({

    el: $('#popular'),

    events: {
        "click #popular-timeframe a":"update_list"
    },

    initialize: function()
    {
        console.warn('init pop');

        $.mobile.changePage( $("#popular"), {
            changeHash: false
        });
        this.photo_collection = new tripmapper.models.photo_collection();
        this.photo_collection.url = tripmapper.api_base + "/search/";
        this.photo_collection.data = {
            sort:"favorite_count",
            n:20
        }
        this.update_list();
    },

    update_list: function( e )
    {
        var time = e && e.currentTarget.id.replace( 'popular-', '' ) || 'time-all';

        var popuar_view = this;
        
        switch (time){
            case 'time-today':
                var today = new Date();
                popuar_view.photo_collection.data.min_date = tripmapper.utils.date_to_snapr_format( today );
                break;
            case 'time-week':
                var day = new Date();
                day.setMilliseconds( day.getMilliseconds() - (7*24*60*60*1000) );
                popuar_view.photo_collection.data.min_date = tripmapper.utils.date_to_snapr_format( day );
                break;
            case 'time-all':
                if(popuar_view.photo_collection.data.min_date){
                    delete popuar_view.photo_collection.data.min_date;
                }
        }
        
        var options = {
            success: function()
            {
                console.warn('success');
                popular_list = new tripmapper.views.thumbs_li({
                    collection: popuar_view.photo_collection,
                    el: $('#popular ul.grid-list').eq(0)
                });
                popular_list.render( function()
                {
                    $.mobile.hidePageLoadingMsg();
                    // store the last query
                    console.warn('store the last query');
                    $('#popular ul.grid-list').eq(0).data('query', {
                        time: time,
                        auth: tripmapper.auth
                    });
                });
            },
            error:function()
            {
                console.warn('error');
                $.mobile.hidePageLoadingMsg();
            }
        }
        
        // only update list if the query has changed or is new
        if (!_.isEqual( $('#popular ul.grid-list').eq(0).data('query'), {time: time, auth: tripmapper.auth} ))
        {
            console.warn('loading');
            $.mobile.loadingMessage = "Loading popular photos";
            $.mobile.showPageLoadingMsg();
            popuar_view.photo_collection.fetch( options );
        }

    }
})