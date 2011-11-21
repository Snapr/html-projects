tripmapper.views.my_account = Backbone.View.extend({
    initialize:function(){
        $.mobile.changePage($("#my-account"),{changeHash:false});
    }
});