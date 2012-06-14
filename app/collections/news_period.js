/*global _  define require */
define(['backbone', 'models/news_period'], function(Backbone, news_period){
return Backbone.Collection.extend({

    model: news_period,

    url: function( method ){
        return snapr.api_base + '/user/activity/';
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
