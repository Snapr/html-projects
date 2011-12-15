snapr.views.thumbs_li = Backbone.View.extend({
    initialize: function(){
        console.log('initialise thumbs_li view');
    },
    template: _.template( $("#thumb-li-template").html() ),
    render: function(callback){
        var el = this.el.empty();
        _.each(this.collection.models,function(item){
            // console.warn(item.get('id'));
        });
        var results = this.collection.models;
        el.html( this.template( { results: results } ) )
        // .listview().listview("refresh");
        if(callback && typeof callback == 'function'){
            callback();
        }
    }
})