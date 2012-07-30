/*global _  define require */
define(['config', 'backbone', 'models/tumblr_post', 'models/user'], function(config, Backbone, tumblr_post, user) {

return Backbone.Collection.extend({

    model: tumblr_post,

    initialize: function () {

    },
    
    url: function( method ){
        // var tumblr_host = user.get('details').linked_services.tumblr_url;
        var tumblr_host = 'matthewbuchanan.name';
        var tumblr_key = 'U41QnbLmjhiKfief3Cd5jZ6fO4ciHwWbrYSCwthlm79rZ0e6aR';
        var type = '';

        return 'http://api.tumblr.com/v2/blog/' + tumblr_host + '/posts' + type + '?api_key=' + tumblr_key;
    },

    fetch: function (options) {
        options = options || {};
        options.jsonp = options.jsonp || 'jsonp';
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
