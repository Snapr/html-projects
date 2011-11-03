tripmapper.views.feed = Backbone.View.extend({
    el:$("#feed"),
    events: {
        "click button.more":"more"
    },
    initialize: function(query){
        console.warn('initialize feed view')
        _this = this;
        _this.el
            .live('pagehide', function(e){
                var photoSwipeInstance = Code.PhotoSwipe.getInstance(_this.el.attr('id'));

                if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null) {
                    Code.PhotoSwipe.detatch(photoSwipeInstance);
                }
                return true; 
            });
        
        $.mobile.changePage($("#feed"),{changeHash:false,transition:"slide"});
        this.photo_collection = new tripmapper.models.photo_collection();
        this.photo_collection.url = tripmapper.api_base + "/search/";
        this.photo_collection.data = tripmapper.utils.get_query_params(query);
        this.photo_collection.data.n = 10;
        this.populate_feed();
    },
    populate_feed: function(additional_data){
        var _this = this;
        var options = {
            success:function(){
                var feed_list = new tripmapper.views.feed_li({
                    collection:_this.photo_collection,
                    el:$('#feed ul').eq(0)
                });
                feed_list.render(function(){
                    // detach the previous photoswipe instance if it exists
                    var photoSwipeInstance = Code.PhotoSwipe.getInstance(_this.el.attr('id'));
                    if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null) {
                        Code.PhotoSwipe.detatch(photoSwipeInstance);
                    }
                    // make sure we set the param backButtonHideEnabled:false to prevent photoswipe from changing the hash
                    var photoSwipeInstance = $("ul.gallery a.gallery_link", _this.el).photoSwipe({backButtonHideEnabled:false},  _this.el.attr('id'));
                    $.mobile.hidePageLoadingMsg();
                });
                // store the query against the feed element
                _this.el.data('query',{data:_this.photo_collection.data,auth:tripmapper.auth});
            },
            error:function(){
                console.warn('error');
                $.mobile.hidePageLoadingMsg();
            }
        }
        if(additional_data){
            options.add = true;
            this.photo_collection.data = $.extend(this.photo_collection.data, additional_data);
        }
        // only populate feed if the query has changed or is new
        // if(!_.isEqual(_this.el.data('query'), {data:_this.photo_collection.data,auth:tripmapper.auth}) ){
            // _this.el.find('ul').empty();
            $.mobile.loadingMessage = "Loading";
            $.mobile.showPageLoadingMsg();
            _this.photo_collection.fetch(options);
        // }
    },
    more: function(){
        this.populate_feed({max_date:this.photo_collection.last().get('date')})
        console.warn('more',{max_date:this.photo_collection.last().get('date')});
    }
})