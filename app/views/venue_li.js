define(['backbone'], function(Backbone){
return Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );

        this.template = this.options.template;

        this.selected_id = this.options.selected_id;

        this.photo_model = this.options.photo_model;

        this.back_query = this.options.back_query;

        this.back_view = this.options.back_view;
    },

    tagName: 'li',

    events: {
        "click a": "select_venue"
    },

    render: function()
    {
        var icon = this.model.get( "categories" ).length &&
            this.model.get( "categories" )[0].icon ||
            'http://foursquare.com/img/categories/none_64.png';
        var selected = (this.model.get( "id" ) == this.selected_id);

        this.$el.html( this.template({
            venue: this.model,
            icon: icon,
            selected: selected
        }) );

        return this;
    },

    select_venue: function()
    {
        var venue = {
            foursquare_venue_id: this.model.get("id"),
            foursquare_venue_name: this.model.get("name")
        };

        var location = _.extend( this.photo_model.get( "location" ), venue );

        this.photo_model.set({
            location: location
        });

        this.back_view.initialize.call({
            query: this.back_query,
            model: this.photo_model,
            el: $("#share-photo")[0]
        });
        snapr.info.current_view = this.back_view;
    }
});
});
