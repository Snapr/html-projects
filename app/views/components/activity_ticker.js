/*global _  define require */
define(['config', 'backbone', 'auth'], function(config, Backbone, auth){
return Backbone.View.extend({

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
                access_token: auth.get('access_token')
            };

        if(config.get('app_group')) {
            data.app_group = config.get('app_group');
        }

        $.ajax({
            no_offline_mode: true, // don't trigger offline mode if this fails
            url:config.get('api_base') + '/user/news/',
            data: data,
            dataType: 'jsonp',
            success: function(response){
                if(response.success){
                    var news = response.response.news[0];
                    if(!news){
                        news = {"type": null};  // prevent undefined error
                    }
                    var html = ticker.template(news);
                    if(ticker.$el.html() != html){
                        ticker.$el.html(html);
                    }
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
});
