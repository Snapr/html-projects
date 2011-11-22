tripmapper.views.my_account = Backbone.View.extend({
    initialize:function(){
        $.mobile.changePage($("#my-account"),{changeHash:false});
        this.el = $("#my-account");
        this.user_settings = new tripmapper.models.user_settings;
        var _this = this;
        var options = {
            success:function(){
                _this.user_settings.linked_services_setup();
                console.warn('success',_this.user_settings);
                console.warn('linked_services',_this.user_settings.get('linked_services'));
                _this.render();
            },
            error:function(){
                console.warn('error',_this);
            }
        }
        this.user_settings.fetch(options);
    },
    template: _.template( $('#my-account-template').html() ),
    render:function(){
        console.warn('render my-account',this.el.find('[data-role="content"]'));
        var account_content = this.el.find('[data-role="content"]');
        account_content.empty().append(this.template({}));

        // set all linked services to false, we will check them off below
        
        var linked_services_list = {
            foursquare:false,
            facebook:false,
            tumblr:false,
            twitter:false
        }

        _.each(this.user_settings.get('linked_services'),function(service,index){
            var v = new tripmapper.views.linked_service;
            v.model = service;
            
            // keep track of linked services
            linked_services_list[service.provider] = true;
            
            account_content.find('.linked-services').append(v.render().el).trigger('create');

        });

        // for all services that are not yet linked, add
        _.each(linked_services_list,function(val,provider){
            if(val == false){
                var v = new tripmapper.views.linked_service;
                v.provider = provider;
                account_content.find('.add-services').append(v.render().el).trigger('create');
            }
        });
    }
});