tripmapper.views.feed = Backbone.View.extend({
    el:$("#feed"),
    initialize: function(query){
        console.warn('initialize feed view')
        $.mobile.changePage($("#feed"),{changeHash:false,transition:"slide"});
        this.photo_collection = new tripmapper.models.photo_collection();
        this.photo_collection.url = tripmapper.api_base + "/search/";
        this.photo_collection.data = tripmapper.utils.get_query_params(query);
        this.photo_collection.data.n = 10;
    },
    populate_feed: function(){
        var _this = this;
        var options = {
            success:function(){
                var feed_list = new tripmapper.views.feed_li({
                    collection:_this.photo_collection,
                    el:$('#feed ul').eq(0)
                });
                feed_list.render($.mobile.hidePageLoadingMsg);
            },
            error:function(){
                console.warn('error');
                $.mobile.hidePageLoadingMsg();
            }
        }
        $.mobile.loadingMessage = "Loading";
        $.mobile.showPageLoadingMsg();
        _this.photo_collection.fetch(options);
    }
})