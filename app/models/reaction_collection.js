snapr.models.reaction_collection = Backbone.Collection.extend({
    model:snapr.models.reaction,
    url: function( method ){
        return snapr.api_base + '/photo/';
    },
    parse: function( d, xhr ){
        if (d.response && d.response.reactions){
            return d.response.reactions;
        }
        else
        {
            return [];
        }
    }
});
