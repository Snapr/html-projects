snapr.models.favorite = Backbone.Model.extend({
    //urlRoot: snapr.api_base + '/favorite/',
    url: function(method){
        if(method){
            switch(method){
                case 'delete':
                    return snapr.api_base + '/favorite/remove/';
                // since backbone treats any model that has an id as not 'new'
                // it will actually trigger an 'update' method to post a favorite
                // default will catch this for us
                default:
                    return snapr.api_base;
            }
        }else{
            return snapr.api_base;
        }
    }
});
