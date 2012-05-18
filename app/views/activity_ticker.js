snapr.views.news_ticker = Backbone.View.extend({

    tagName: "div",
    className: "news-ticker",

    initialize: function(){
        _.bindAll( this );
        this.template = _.template( $("#news-ticker-template").html() );
    },

    render: function(){
        var ticker=this,
            data = {
                n: 1,
                access_token: snapr.auth.get('access_token')
            };

        if(snapr.app_group) {
            data.app_group = snapr.app_group;
        }

        $.ajax({
            url:snapr.api_base + '/user/news/',
            data: data,
            dataType: 'jsonp',
            success: function(response){
                if(response.success){
                    news = response.response.news[0];
                    if(!news){
                        news = {"type": null};  // prevent undefined error
                    }
                    ticker.$el.html(ticker.template(news));
                }else{
                    console.warn('API error fetching news for ticker.');
                }
            },
            error: function(){
                console.warn('AJAX error fetching news for ticker.');
            },
            complete: $.noop  // overwirte any default complete function that may be set with noop
        });
        return this;
    },

    tick: function(interval){
        if(interval === undefined){
            interval = 30;
        }
        this.interval_id = setInterval(this.render, interval * 1000);
        return this;
    },

    stop: function(){
        clearInterval(this.interval_id);
        return this;
    }
});
