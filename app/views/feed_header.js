tripmapper.views.feed_header = Backbone.View.extend({
    
    initialize: function()
    {
        this.query_data = this.options.query_data;
        this.template = _.template( $("#feed-header-template").html() );
        this.render();
    },
    
    render: function()
    {
        this.el.append( this.template( {query_data: this.query_data} ));

        return this;
    }
    
});

// 
// if (query_data.keywords || query_data.username)
// {
// 
//     this.el.find(".feed-header").empty().append( this.header_template( {query_data: query_data} ) );
// }
// else if (query_data.spot)
// {
//     this.header_template = _.template( $("#feed-header-template").html() );
//     this.el.find(".feed-header").empty().append( this.header_template( {query_data: query_data} ) );
// }
// else
// {
//     this.el.find(".feed-header").empty();
// }
