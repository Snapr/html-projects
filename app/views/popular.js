tripmapper.views.popular = Backbone.View.extend({
    el: $('#popular'),
    events: {
        "change #popular-timeframe":"update_list"
    },
    initialize: function(){
        $.mobile.changePage($("#popular"),{changeHash:false});
        this.photo_collection = new tripmapper.models.photo_collection();
        this.photo_collection.url = tripmapper.api_base + "/search/";
        this.photo_collection.data = {
            sort:"favorite_count",
            n:20
        }
        
    },
    update_list: function(){
        var _this = this;
        console.log('render popular view');
        var time = $('input:radio[name=options-popular-timeframe]:checked').val();
        console.log('popular',time);
        var options = {
            success:function(){
                var popular_list = new tripmapper.views.thumbs_li({
                    collection:_this.photo_collection,
                    el:$('#popular ul').eq(0)
                });
                popular_list.render($.mobile.hidePageLoadingMsg);
            },
            error:function(){
                console.warn('error');
                $.mobile.hidePageLoadingMsg();
            }
        }
        $.mobile.loadingMessage = "Loading popular photos";
        $.mobile.showPageLoadingMsg();
        switch(time){
            case 'time-today':
                var today = new Date();
                _this.photo_collection.data.min_date = date_to_snapr_format(today);
                _this.photo_collection.fetch(options);
                break;
            case 'time-week':
                var day = new Date();
                day.setMilliseconds(day.getMilliseconds() - (7*24*60*60*1000));
                _this.photo_collection.data.min_date = date_to_snapr_format(day);
                _this.photo_collection.fetch(options);
                break;
            default:
                _this.photo_collection.fetch(options);
        }
    }
})