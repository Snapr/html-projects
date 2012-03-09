snapr.models.favorite = Backbone.Model.extend({
    urlRoot: function()
    {
        return snapr.api_base + '/favorite/';
    },
<<<<<<< HEAD
    url: function( method )
    {
        if (method)
        {
            switch( method )
            {
=======
    url: function(method){
        if(method){
            switch(method){
>>>>>>> 4eed92115299c67664deb1f5aec1624d6b3f8c60
                case 'delete':
                    return this.urlRoot() + 'remove/';
                // since backbone treats any model that has an id as not 'new'
                // it will actually trigger an 'update' method to post a favorite
                // default will catch this for us
                default:
                    return this.urlRoot();
            }
<<<<<<< HEAD
        }
        else
        {
            return this.urlRoot();
=======
        }else{
            return this.urlRoot();;
>>>>>>> 4eed92115299c67664deb1f5aec1624d6b3f8c60
        }
    }
});
