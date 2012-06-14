/*global _  define require */
define(['backbone', 'models/reaction'], function(Backbone, reaction_model){

return Backbone.Collection.extend({
    model: reaction_model,
    url: function( method ){
        return snapr.api_base + '/reaction/';
    },
    parse: function( d, xhr ){
        if (d.response && d.response.reactions){
            return d.response.reactions;
        }else{
            return [];
        }
    },
    comparator: function( reaction ){
        return new Date( reaction.get( "date" ) ).getTime();
    }
});

});
