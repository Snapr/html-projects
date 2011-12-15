snapr.models.favorite = Backbone.Model.extend({
    urlRoot: snapr.api_base + '/favorite/',
    url: function(method){
        if(method){
            switch(method){
                case 'delete':
                    return this.urlRoot + 'remove/';
                // since backbone treats any model that has an id as not 'new' 
                // it will actually trigger an 'update' method to post a favorite
                // default will catch this for us
                default:
                    return this.urlRoot;
            }
        }else{
            return this.urlRoot;
        }
    }
});