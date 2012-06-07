/*global _ Route define require */
define(['backbone'], function(Backbone){

return Backbone.Model.extend({

    urlRoot: function(){
        return snapr.api_base + '/photo/';
    },

    url: function( method ){
        return this.urlRoot();
    },

    parse: function( d, xhr ){
        // handle cases where we're parsing response from a direct server request
        if (d.response && d.response.photos)
        {
            return d.response.photos[0];
        }
        // handle cases where we're parsing a response from a collection
        else if (d.id)
        {
            return d;
        }
        else
        {
            return {};
        }
    },

    change_status: function( status, options ){
        var ajax_options = _.extend( options || {}, {
            url: this.urlRoot() + "change_status/",
            dataType: "jsonp",
            data: _.extend( snapr.auth.attributes, {
                id: this.get("id"),
                status: status,
                _method: "POST"
            })
        });
        $.ajax( ajax_options );
    },

    flag: function( options ){
        var ajax_options = _.extend( options || {}, {
            url: snapr.api_base + "/report/",
            dataType: "jsonp",
            data: _.extend( snapr.auth.attributes, {
                id: this.get("id"),
                _method: "POST"
            })
        });
        $.ajax( ajax_options );
    },

    'delete': function( options ){
        var ajax_options = _.extend( options || {}, {
            url: snapr.api_base + "/remove/",
            dataType: "jsonp",
            data: _.extend( snapr.auth.attributes, {
                id: this.get("id"),
                _method: "POST"
            })
        });
        $.ajax( ajax_options );
    }
});
});
