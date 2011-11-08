tripmapper.models.reaction_collection = Backbone.Collection.extend({
    model:tripmapper.models.reaction,
    url: tripmapper.api_base + '/reaction/',
    parse: function(d,xhr){
        if(d.response && d.response.reactions){
            return d.response.reactions;
        }else{
            return [];
        }
    }
});