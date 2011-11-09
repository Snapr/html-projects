tripmapper.views.feed_list = Backbone.View.extend({
    el: $('#feed ul').eq(0),
    initialize: function(){
        this.render();
    },
    render: function(callback){
        var el = this.el.empty();
        _.each(this.collection.models,function(item){
            var li = new tripmapper.views.feed_li({model:item});
            li.model.bind('change:comments',function(){li.update_counts()});
            el.append(li.render().el);
        });
        // create jquery mobile markup, set to listview and refresh
        el.trigger("create").listview().listview("refresh");

        if(callback && typeof callback == 'function'){
            callback();
        }
    }
})