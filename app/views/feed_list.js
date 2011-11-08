tripmapper.views.feed_list = Backbone.View.extend({
    el: $('#feed ul').eq(0),
    initialize: function(){
        console.log('initialise feed_li view');
        this.render();
    },
    render: function(callback){
        var el = this.el.empty();
        _.each(this.collection.models,function(item){
            var li = new tripmapper.views.feed_li({model:item});
            el.append(li.render().el);
        });
        el.trigger("create").listview().listview("refresh");
        // console.warn('delegateEvents', this.delegateEvents)
        
        // for(item in this.collection.models){
        //     
        // }
        // _.each( this.models, function( item, i ){
            
            
            // el.html( compiled_template( { results: this.collection.models } ) ).trigger("create").listview().listview("refresh");
            
            
        // });
        // var compiled_template = _.template( $("#feed-li-template").html() );
        
        
        if(callback && typeof callback == 'function'){
            callback();
        }
    },
    clk: function(){
        console.warn('clk')
    }
})