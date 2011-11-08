tripmapper.views.feed_li = Backbone.View.extend({
    events: {
        "click .reactions-button":"load_reactions"
    },
    initialize: function(){
        // console.warn('initialize feed_li',this.model)
    },
    template: _.template( $("#feed-li-template").html() ),
    load_reactions: function(){
        console.warn('load_reactions',this,this.model.id);
        this.reactions = new tripmapper.views.reactions({
            id:this.model.id,
            el:this.el.find('ul')
        });
        // this.reactions.render();
        // var reactions = new tripmapper.views.reactions(this.model.get('id'));
    },
    render: function(){
        this.el = $(this.template({item:this.model}));
        $('.reactions-button ul:visible').listview();
        // delegateEvents makes the event bindings in this view work 
        // even though it is a subview of feed_list (very important)
        this.delegateEvents();
        return this;
    }
});