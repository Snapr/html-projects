snapr.views.reactions = Backbone.View.extend({
    initialize: function(){
        // console.log('initialize reactions',this);
        this.reaction_collection = new snapr.models.reaction_collection;
        this.reaction_collection.data = {photo_id:this.id}
        _this = this;
        this.reaction_collection.fetch({success:function(){_this.render()}})
    },
    template: _.template( $('#reaction-li-template').html() ),
    render: function(callback){
        // console.log('element',this.el)
        var el = this.el.empty();
        // console.log('models', this.reaction_collection.models);
        _this = this;
        _.each(this.reaction_collection.models,function(reaction){
            el.append(_this.template({reaction:reaction}));
        })
        el.trigger('create').listview().listview('refresh');

        if(callback && typeof callback == 'function'){
            callback();
        }
    }

});
