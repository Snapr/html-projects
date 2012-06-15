/*global _  define require */
define(['config', 'backbone', 'models/news_period'], function(config, Backbone, news_period){
return Backbone.Collection.extend({

    model: news_period,

    url: function( method ){
        return config.get('api_base') + '/user/activity/';
    },

    parse: function( d, xhr ){
        if (d.response && d.response.news){
            return d.response.news;
        }else{
            return [];
        }
    }

});

});
