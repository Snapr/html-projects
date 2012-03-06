snapr.views.venue_li = Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );

        this.template = this.options.template;

        this.selected_id = this.options.selected_id;

        this.back_query = this.options.back_query;

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

        $(this.el)
            .empty()
            .append( this.template({
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

        snapr.info.current_view = new snapr.views.share_photo({
            query: _.extend(this.back_query, { foursquare_venue: venue} ),
            el: $("#share-photo")
        });
    }

});