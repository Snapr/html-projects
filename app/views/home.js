tripmapper.views.home = Backbone.View.extend({
    el:$('#menu'),
    initialize:function(){
        var login_logout = new tripmapper.views.login_logout({model: tripmapper.auth});
        login_logout.render();
        var _this = this;
        tripmapper.auth.bind("change:username",function(){
            login_logout.model = tripmapper.auth;
            login_logout.render();
            _this.render();
        });
        if($.mobile.activePage && $.mobile.activePage.find("#menu").length < 1){
            console.warn('changing page');
            $.mobile.changePage("#menu");
        }
        window.location.hash = "";
        this.render();
    },
    render:function(){
        if(tripmapper.auth.get("access_token")){
            this.el.find('a.my-snaps .ui-btn-text').text('My Snaps');
            this.el.find('a.my-snaps').attr('href',"#feed/?username="+tripmapper.auth.get("username").toLowerCase());
        }else{
            this.el.find('a.my-snaps .ui-btn-text').text('Latest Photos');
            this.el.find('a.my-snaps').attr('href',"#feed");
        }
    }
});




