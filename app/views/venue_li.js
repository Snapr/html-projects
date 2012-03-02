snapr.views.venue_li = Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );

        this.template = this.options.template;

        this.model.bind( "change", this.refresh );

    },

    tagName: 'li',

    events: {
    },

    render: function()
    {
        var icon = this.model.get( "categories" ).length &&
            this.model.get( "categories" )[0].icon ||
            'http://foursquare.com/img/categories/none_64.png';


        $(this.el)
            .empty()
            .append( this.template({
                venue: this.model,
                icon: icon
            }) );

        return this;
    },
});