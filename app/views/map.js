tripmapper.views.map = Backbone.View.extend({
    initialize: function(query){
        console.log('initialise map view');
        this.query = tripmapper.utils.get_query_params(query);
        $.mobile.changePage("#map",{changeHash:false});
        this.render();
    },
    render: function(callback){
        // var el = this.el.empty();
        if(this.query){
            console.warn('query',this.query);
        }
        if(callback){
            callback();
        }
    }
})