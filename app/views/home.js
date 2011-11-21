tripmapper.views.home = Backbone.View.extend({
    initialize:function(){
        if($.mobile.activePage && $.mobile.activePage.find("#home").length < 1){
            console.warn('changing page');
            $.mobile.changePage("#home");
        }
        this.el = $('#home');
        window.location.hash = "";
        var _this = this;
        tripmapper.auth.bind("set:username",function(){
            console.warn('set:username')
            _this.render();
        });
        tripmapper.auth.bind("unset:username",function(){
            console.warn('unset:username')
            _this.render();
        });

        tripmapper.auth.change();
        _this.render();
    },
    template: _.template( $('#home-template').html() ),
    render:function(){
        console.warn('render home')
        if(tripmapper.auth && tripmapper.auth.attributes.username){
            var logged_in = true,
            username = tripmapper.auth.attributes.username;
            
        }else{
            var logged_in = false,
            username = null;
        }
        this.el.find('[data-role="content"]')
            .replaceWith(
            $(this.template({logged_in:logged_in,username:username}))
            );
        this.el.trigger('create');
    }
});