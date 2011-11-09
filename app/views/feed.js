tripmapper.views.feed = Backbone.View.extend({
    el:$("#feed"),
    events: {
        "click button.more":"more"
    },
    initialize: function(query){
        console.warn('initialize feed view',query);
        var query_data = tripmapper.utils.get_query_params(query);
        
        this.el.find('h1').text("Feed");
        
        if (query_data.username) {
            this.el.find('h1').text(query_data.username);
        }
        if (query_data.keywords) {
            this.el.find('h1').text("Search for: " + query_data.keywords);
        }
        if (query_data.area) {
            this.el.find('h1').text("Location Feed");
        }
        if (query_data.spot) {
            this.el.find('h1').text("Venue Feed");
        }
        if(query_data.favorited_by){
            this.el.find('h1').text("Favorites");
        }
        if(query_data.group == 'following'){
            this.el.find('h1').text("Feed");
        }
        if(_.isEqual(query_data, {})){
            this.el.find('h1').text("Latest Photos");
        }
        
        _this = this;
        _this.el
            .live('pagehide', function(e){
                var photoSwipeInstance = Code.PhotoSwipe.getInstance(_this.el.attr('id'));

                if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null) {
                    Code.PhotoSwipe.detatch(photoSwipeInstance);
                }
                return true; 
            });
        
        _this.el.find('ul').empty();
        
        $.mobile.changePage($("#feed"),{changeHash:false,transition:"slide"});
        this.photo_collection = new tripmapper.models.photo_collection();
        this.photo_collection.url = tripmapper.api_base + "/search/";
        this.photo_collection.data = query_data;
        this.photo_collection.data.n = 10;
        this.populate_feed();
    },
    populate_feed: function(additional_data){
        var _this = this;
        var options = {
            success:function(){
                var feed_list = new tripmapper.views.feed_list({
                    collection:_this.photo_collection
                });
                // console.warn('feed_list',feed_list);
                // feed_list.render();
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