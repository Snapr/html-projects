tripmapper.views.thumbs_list = Backbone.View.extend({
    initialize: function(){
        console.log('initialise thumbs_list view');
    },
    render: function(callback){
        // console.log('render thumbs_list view',this.collection.models);
        var popular_list = this.el.empty();
        var compiled_template = _.template( $("#thumb-template").html() );
        popular_list.html( compiled_template( { results: this.collection.models } ) ).listview().listview("refresh");
        if(callback){
            callback();
        }
    }
})