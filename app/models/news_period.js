/*global _  define require */
define(['backbone', 'collections/activity_event'], function(Backbone, activity_event_collection){
return Backbone.Model.extend({

    initialize: function( period ){
        var events = _.clone( period.events );
        this.set({events: new activity_event_collection( events )});
    }

});

});
