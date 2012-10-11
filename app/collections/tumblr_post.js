/*global _  define require */
define(['config', 'backbone', 'models/tumblr_post', 'models/user'], function(config, Backbone, tumblr_post, user) {

return Backbone.Collection.extend({

    model: tumblr_post,

    initialize: function () {

    },

    tumblr_url: function( host, key ){
        host = host || 'snaprtest.tumblr.com';
        key = key || '0i9zD5xabR9QlY0BWhFV2XiRr1wI329fPlH4S5kPuvuBWkRQUb';
        return 'http://api.tumblr.com/v2/blog/' + host + '/posts?api_key=' + key;
    },

    fetch: function (options) {
        options = options || {};
        options.jsonp = options.jsonp || 'jsonp';

        options.url = this.tumblr_url(options.host, options.key);

        return Backbone.Collection.prototype.fetch.call(this, options);
    },

    parse: function( d, xhr ){
        if (d.response && d.response.posts){
            return d.response.posts;
        } else{
            return [];
        }
    }

});

});
