snapr.models.comment = Backbone.Model.extend({
    //urlRoot: snapr.api_base + '/comment/',
    url: function(method){
        if(method){
            switch(method){
                case 'create':
                    return snapr.api_base;
                case 'update':
                    return snapr.api_base + '/comment/edit/';
                case 'delete':
                    return snapr.api_base + '/comment/delete/';
                default:
                    return snapr.api_base;
            }
        }else{
            return snapr.api_base;
        }
    }
});
