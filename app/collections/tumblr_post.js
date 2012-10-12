/*global _  define require */
define(['config', 'backbone', 'models/tumblr_post', 'models/user'], function(config, Backbone, tumblr_post, user) {

return Backbone.Collection.extend({

    model: tumblr_post,

    initialize: function () {

    },

    tumblr_url: function( host, key ){
        host = host || config.get('dafault_tumblr_host');
        key = key || config.get('tumblr_key');
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
            this.blog_title = d.response.blog.title;
            return d.response.posts;
        } else{
            return [];
        }
    }

});

});
