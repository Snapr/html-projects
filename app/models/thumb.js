tripmapper.models.thumb = Backbone.Model.extend({
    defaults: {
        "username": "", 
        "width": 0, 
        "secret": "", 
        "location": {
            "latitude": 0,
            "longitude": 0
        }, 
        "date": "", 
        "description": "", 
        "server_id": "", 
        "id": "", 
        "height": 0
    },
    initialize: function(){
        console.log('initialize a thumb');
    }
});