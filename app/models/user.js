tripmapper.models.user = Backbone.Model.extend({
    urlRoot: tripmapper.api_base + '/user/',
    url: function(method){
        return this.urlRoot + 'details/';
    }
});