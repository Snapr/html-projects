snapr.models.photo_collection = Backbone.Collection.extend({
    model:snapr.models.photo,
    data:{},
    url: function( method ){
        return snapr.api_base + '/search/';
    },
    parse: function( d, xhr ){
        if (d.success && d.response && d.response.photos){
            return d.response.photos;
        }else{
            return [];
        }
    },
    fetch_newer: function(){
        this.fetch({add:true, data:{min_date: this.models[0].get('date')}});
    },
    fetch_older: function(){
        this.fetch({add:true, data:{paginate_from: this.models[this.length-1].get('id')}});
    },
    get_photo_by_id: function( id ){
        return this.filter( function( model ){
            return model.get("id") == id;
        })[0];
    }
});
