snapr.views.dash_add_person = snapr.views.dialog.extend({

    initialize: function()
    {
        snapr.views.dialog.prototype.initialize.call( this );

        this.$el.find("ul.people-list").empty();
        this.$el.find(".ui-input-text").val('');

        this.collection = new snapr.models.user_collection();

        var people_view = this;

        this.collection.bind( "reset", function()
        {
            people_view.render();
        });

        this.change_page( {
            transition: this.transition
        });

        this.$el.live( "pageshow", function( e, ui ){
            people_view.$('#people-search').focus();
        });
    },

    events: {
        "keyup input": "search",
        "click .x-back": "back"
    },

    render: function()
    {
        var people_list = this.$el.find("ul.people-list").empty();

        var people_li_template = _.template( $("#people-li-template").html() );

        if(this.collection.length){
            snapr.no_results.$el.remove();  // use remove(), hide() keeps it hidden and requires show() later
            _.each( this.collection.models, function( model ){
                var people_li = new snapr.views.people_li({
                    template: people_li_template,
                    model: model
                });

                people_list.append( people_li.render().el );
            });
        }else{
            snapr.no_results.render('Oops.. Nobody here yet.', 'delete').$el.appendTo(people_list);
        }

        var this_back = this.back;
        var this_back_view = this.back_view;
        people_list.find('a').click(function(e){
            e.preventDefault();
            var username = $(this).data('username'),
                stream = new snapr.models.dash_stream({
                    query: {
                        username: username
                    },
                    display: {
                        "title": "Photos by "+username,
                        "short_title": username,
                        "type": "search"
                    }
                });
            $.mobile.showPageLoadingMsg();
            stream.save({}, {success: function(){
                dash.add(stream);
                $.mobile.hidePageLoadingMsg();
            }});
            this_back_view.$el.removeClass('edit');
            this_back();
        });

        people_list.listview().listview("refresh");


    },

    search: function(e)
    {

        var keywords = $(e.target).val();
        var this_view = this;


        this.timer && clearTimeout(this.timer);
        this.xhr && this.xhr.abort();

        if (keywords.length > 1){

            this.timer = setTimeout( function() {
                this_view.timer = null;
                this_view.$el.addClass('loading');
                this_view.xhr = this_view.collection.fetch({
                    data:{
                        username:keywords,
                        n:20,
                        detail:1
                    },
                    url: snapr.api_base + '/user/search/',
                    success: function(){
                        this_view.xhr = null;
                        this_view.$el.removeClass('loading');
                    }
                });
            }, 300 );

        }else{
            if(this_view.collection.length){  // stops the list showing no-results on initial searches
                this_view.collection.reset();
            }
        }
    }

});
