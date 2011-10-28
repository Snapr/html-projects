tripmapper.views.login_logout = Backbone.View.extend({
    el:$('#menu .login-logout').eq(0),
    render: function(){
        var el = this.el;
        if(this.model.get("access_token")){
            el.find('.ui-btn-text').text('Log Out');
            el.attr('href',"#logout");
        }else{
            el.find('.ui-btn-text').text('Log In');
            el.attr('href',"#login");
        }
    }
});