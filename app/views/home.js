tripmapper.views.home = Backbone.View.extend({
    initialize:function(){
        if($.mobile.activePage && $.mobile.activePage.find("#menu").length < 1){
            console.warn('changing page');
            $.mobile.changePage("#menu");
        }
        this.el = $('#menu');
        window.location.hash = "";
        var _this = this;
        tripmapper.auth.bind("change:username",function(){
            console.warn('change:username')
            _this.render();
        });
        tripmapper.auth.change();
    },
    render:function(){
        // this is kinda messy. need to move it to a template
        if(tripmapper.auth.get("username")){
            this.el.find('a.my-snaps .ui-btn-text').text('My Snaps');
            this.el.find('a.my-snaps').attr('href',"#feed/?username="+tripmapper.auth.get("username").toLowerCase());
            this.el.find('a.login-logout .ui-btn-text').text('Log Out');
            this.el.find('a.login-logout').attr('href',"#logout");

            this.el.find('a.join-account .ui-btn-text').text('My Account');
            this.el.find('a.join-account').attr('href',"#account");

        }else{
            this.el.find('a.my-snaps .ui-btn-text').text('Latest Photos');
            this.el.find('a.my-snaps').attr('href',"#feed");
            this.el.find('a.login-logout .ui-btn-text').text('Log In')
            this.el.find('a.login-logout').attr('href',"#login");

            this.el.find('a.join-account .ui-btn-text').text('Join')
            this.el.find('a.join-account').attr('href',"#join");
        }
    }
});