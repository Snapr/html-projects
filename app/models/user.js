tripmapper.models.user = Backbone.Model.extend({
    urlRoot: tripmapper.api_base + '/user/',
    url: function(method){
        if(method){
            switch(method){
                case 'create':
                    return this.urlRoot + 'signup/';
                // case 'update':
                //     return this.urlRoot + 'edit/';
                // case 'delete':
                //     return this.urlRoot + 'delete/';
                default:
                    return this.urlRoot + 'details/';
            }
        }else{
            return this.urlRoot;
        }
    }
});