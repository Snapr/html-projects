tripmapper.views.feed_li = Backbone.View.extend({
    initialize: function(){
        console.log('initialise feed_li view');
    },
    render: function(callback){
        var el = this.el.empty();
        var compiled_template = _.template( $("#feed-li-template").html() );
        el.html( compiled_template( { results: this.collection.models } ) ).listview().listview("refresh");
        if(callback){
            callback();
        }
    }
})