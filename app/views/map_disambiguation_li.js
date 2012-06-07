/*global _ Route define require */
define(['backbone'], function(Backbone){
return Backbone.View.extend({

    tagName: "li",

    events: {
        "click .map-link": "goto_map"
    },

    initialize: function()
    {
        this.template = this.options.template;
        this.location = this.options.result;
        this.map = this.options.map;
        this.parent_view = this.options.parent_view;
    },

    render: function()
    {
        this.$el.html( this.template( {location: this.location} ) );

        return this;
    },

    goto_map: function()
    {
        this.map.fitBounds( this.location.geometry.viewport );
        this.parent_view.hide_dis();
    }
});
});
