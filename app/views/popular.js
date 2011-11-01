tripmapper.views.popular = Backbone.View.extend({
    el: $('#popular'),
    events: {
        "change #popular-timeframe":"update_list"
    },
    initialize: function(){
        console.warn('init pop')
        $.mobile.changePage($("#popular"),{changeHash:false});
        this.photo_collection = new tripmapper.models.photo_collection;
        this.photo_collection.url = tripmapper.api_base + "/search/";
        this.photo_collection.data = {
            sort:"favorite_count",
            n:20
        }
        this.update_list();
    },
    update_list: function(){
        var _this = this;
        console.log('render popular view',_this);
        var time = $('input:radio[name=options-popular-timeframe]:checked').val();
        console.log('popular',time);
        switch(time){
            case 'time-today':
                var today = new Date();
                _this.photo_collection.data.min_date = tripmapper.utils.date_to_snapr_format(today);
                break;
            case 'time-week':
                var day = new Date();
                day.setMilliseconds(day.getMilliseconds() - (7*24*60*60*1000));
                _this.photo_collection.data.min_date = tripmapper.utils.date_to_snapr_format(day);
                break;
            case 'time-all':
                if(_this.photo_collection.data.min_date){
                    console.warn('delete')
                    delete _this.photo_collection.data.min_date;
                }
        }
        var options = {
            success:function(){
                console.warn('success')
                popular_list = new tripmapper.views.thumbs_li({
                    collection:_this.photo_collection,
                    el:$('#popular ul').eq(0)
                });
                popular_list.render(function(){
                    $.mobile.hidePageLoadingMsg();
                    // store the last query
                    console.warn('store the last query');
                    $('#popular ul').eq(0).data('query',{time:time,auth:tripmapper.auth});
                });
            },
            error:function(){
                console.warn('error');
                $.mobile.hidePageLoadingMsg();
            }
        }

        // only update list if the query has changed or is new
        if(!_.isEqual($('#popular ul').eq(0).data('query'), {time:time,auth:tripmapper.auth}) ){
            console.warn('loading');
            $.mobile.loadingMessage = "Loading popular photos";
            $.mobile.showPageLoadingMsg();
            _this.photo_collection.fetch(options);
        }

    }
})