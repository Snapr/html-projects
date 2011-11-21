tripmapper.models.user_settings = Backbone.Model.extend({
    urlRoot: tripmapper.api_base + '/user/',
    url: function(method){
        if(method){
            switch(method){
                case 'create':
                    return this.urlRoot + 'signup/';
                case 'update':
                    return this.urlRoot + 'settings/';
                default:
                    this.data = _.extend(this.data || {}, {linked_services:true});
                    return this.urlRoot + 'settings/';
            }
        }else{
            return this.urlRoot;
        }
    },
    parse:function(d,xhr){
        if(d.response){
            return d.response;
        }
    },
    setup_linked_services: function(){
        var linked_services = this.get('linked_services');
        _.each(linked_services,function(service,key){
            var linked = new tripmapper.models.linked_service(service);
        })
    }
});