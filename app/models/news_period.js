define(['backbone'], function(Backbone){
return  Backbone.Model.extend({

    initialize: function( period )
    {
        var events = _.clone( period.events );
        this.set({events: new snapr.models.activity_event_collection( events )});
    }

});});
