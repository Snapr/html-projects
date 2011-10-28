tripmapper.views.home = Backbone.View.extend({
    el:$('#menu'),
    initialize:function(){
        if(!tripmapper.auth || !tripmapper.auth.get("access_token")){
            console.warn('no access_token')
            tripmapper.auth = new tripmapper.models.auth;
            tripmapper.auth.url = tripmapper.access_token_url;
        }
        var login_logout = new tripmapper.views.login_logout({model: tripmapper.auth});
        login_logout.render();
        tripmapper.auth.bind("change",function(){
            login_logout.model = tripmapper.auth;
            login_logout.render();
        });
    }
});




