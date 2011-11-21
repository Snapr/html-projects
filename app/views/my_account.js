tripmapper.views.my_account = Backbone.View.extend({
    initialize:function(){
        $.mobile.changePage($("#my-account"),{changeHash:false});
        this.user_settings = new tripmapper.models.user_settings;
        var _this = this;
        var options = {
            success:function(){
                _this.user_settings.linked_services_setup();
                console.warn('success',_this.user_settings);
                console.warn('linked_services',_this.user_settings.get('linked_services'));
            },
            error:function(){
                console.warn('error',_this);
            }
        }
        this.user_settings.fetch(options);
    }
});