tripmapper.views.thumbs_li = Backbone.View.extend({
    initialize: function(){
        console.log('initialise thumbs_li view');
    },
    render: function(callback){
        var el = this.el.empty();
        var compiled_template = _.template( $("#thumb-li-template").html() );
        el.html( compiled_template( { results: this.collection.models } ) ).listview().listview("refresh");
        if(callback){
            callback();
        }
    }
})