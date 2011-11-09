tripmapper.views.feed_li = Backbone.View.extend({
    events: {
        "expand .reactions-button":"load_reactions",
        "click .like-button":"like",
        "submit .comment-form":"comment"
    },
    initialize: function(){
        // console.warn('initialize feed_li',this.model)
    },
    template: _.template( $("#feed-li-template").html() ),
    load_reactions: function(){
        if(!this.reactions){
            console.warn('load_reactions',this,this.model.id);
            this.reactions = new tripmapper.views.reactions({
                id:this.model.id,
                el:this.el.find('ul')
            });
        }else{
            console.warn('reactions already loaded');
        }
    },
    render: function(){
        this.el = $(this.template({item:this.model}));
        this.el.find('.reactions-button ul:visible').listview();
        // delegateEvents makes the event bindings in this view work 
        // even though it is a subview of feed_list (very important)
        this.delegateEvents();
        return this;
    },
    like: function(){
        if(tripmapper.auth.get('username')){
            if(this.model.get('favorite')){
                console.warn('already liked - unlike');
            }else{
                console.warn('like',this.model.url());
            }
        }else{
            window.location.hash = '#login';
        }
    },
    update_counts: function(){
        // change the button text for the reactions button
        this.el.find('.reactions-button h3 .ui-btn-text').text(this.model.get('comments') + ' comments and ' +  this.model.get('favorite_count') + ' favorites');
        // show the button if it was previously hidden and create the jquery mobile markup
        this.el.find('.reactions-button').show().trigger('create');
    },
    comment: function(){
        var comment = this.el.find('.comment-form textarea').val();
        var id = this.model.get('id');
        var c = new tripmapper.models.comment
        c.data = {
            id:id,
            comment:comment
        }
        // make a copies of 'this' and the .comment-area to pass to functions in the options object
        var _this = this;
        var _comment_area = this.el.find('.comment-area').eq(0);

        var options = {
            success: function(s){
                if(s.get('success')){
                    console.warn('save comment success');
                    var comment_count = parseInt(_this.model.get('comments')) + 1;
                    _this.model.set({comments:comment_count});
                    if(!_this.reactions){
                        _comment_area.find('.comment-form textarea').val('');
                        _comment_area.trigger('collapse');
                        _this.el.find('.reactions-button').trigger('expand');
                    }else{
                        _this.reactions.reaction_collection.fetch({
                            success:function(s){
                                console.warn('fetch reactions success',s);
                                _comment_area.find('.comment-form textarea').val('');
                                _comment_area.trigger('collapse');
                                console.warn('render reactions');
                                _this.reactions.render(function(){
                                    console.warn('rendered reactions');
                                })
                            },
                            error:function(e){
                                console.warn('error',e);
                            }
                        });
                    }
                }
            },
            error: function(error){
                console.warn('error',error);
            }
        }
        // the empty object in this save call is important, 
        // without it, the options object will not be used
        c.save({},options);
    }
});