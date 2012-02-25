snapr.models.reaction_collection = Backbone.Collection.extend({
    model:snapr.models.reaction,
    url: snapr.api_base + '/reaction/',
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