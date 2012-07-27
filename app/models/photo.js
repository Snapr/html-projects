/*global _  define require */
define(['config', 'backbone', 'auth'], function(config, Backbone, auth){

return Backbone.Model.extend({

    urlRoot: function(){
        return config.get('api_base') + '/photo/';
    },

    url: function( method ){
        return this.urlRoot();
    },

    parse: function( d, xhr ){
        // handle cases where we're parsing response from a direct server request
        if (d.response && d.response.photos){
            d.response.photos[0].display_username = auth.fill_username(d.response.photos[0]);
            return d.response.photos[0];
        }
        // handle cases where we're parsing a response from a collection
        else if (d.id){
            d.display_username = auth.fill_username(d);
            return d;
        }else{
            return {};
        }
    },

    change_status: function( status, options ){
        var ajax_options = _.extend( options || {}, {
            url: this.urlRoot() + "change_status/",
            dataType: "jsonp",
            data: _.extend( auth.attributes, {
                id: this.get("id"),
                status: status,
                _method: "POST"
            })
        });
        $.ajax( ajax_options );
    },

    flag: function( options ){
        var ajax_options = _.extend( options || {}, {
            url: config.get('api_base') + "/report/",
            dataType: "jsonp",
            data: _.extend( auth.attributes, {
                id: this.get("id"),
                _method: "POST"
            })
        });
        $.ajax( ajax_options );
    },

    'delete': function( options ){
        var ajax_options = _.extend( options || {}, {
            url: config.get('api_base') + "/remove/",
            dataType: "jsonp",
            data: _.extend( auth.attributes, {
                id: this.get("id"),
                _method: "POST"
            })
        });
        $.ajax( ajax_options );
    }
});
});
