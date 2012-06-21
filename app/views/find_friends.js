// abstract base class for both twitter and facebook

/*global _  define require */
define(['config', 'views/base/page', 'collections/user', 'views/people_li', 'views/components/no_results',
    'utils/link_service'],
function(config, page_view, user_collection, people_li, no_results, link_service){
return page_view.extend({

    post_initialize: function(){
        this.people_li_template = _.template( $("#people-li-template").html() );

        this.collection = new user_collection();
        this.collection.bind( "reset", _.bind(this.render, this) );
    },

    post_activate: function(){

        this.$el.find("ul.people-list").empty();

        this.change_page();

        this.service = this.options.service;

        this.search();
    },

    dialog_closed: function(){
        this.$el.find("ul.people-list").empty();
        this.search();
    },

    transition: 'none',

    events: {
        "keyup input": "search",
        "vclick .ui-input-clear": "search"
    },

    render: function(){
        var people_list = this.$el.find("ul.people-list").empty();
        var this_view = this;

        if(this.collection.length){
            _.each( this.collection.models, function( model ){
                var li = new people_li({
                    template: this_view.people_li_template,
                    model: model
                });

                people_list.append( li.render().el );
            });
        }else{
            no_results.render('Oops.. Nobody here yet.', 'delete').$el.appendTo(people_list);
        }

        people_list.listview().listview("refresh");
    },

    search: function(){
        var username = this.$('input').val(),
            this_view = this,
            data = {
                n:20,
                detail:1
            };

        this.timer && clearTimeout(this.timer);
        this.xhr && this.xhr.abort();

        if (username){
            if (this.service == 'twitter'){
                data.twitter_handle = username;
            }else if (this.service == 'facebook'){
                data.name = username;
            }
        }

        this.timer = setTimeout( function() {
            this_view.$el.addClass('loading');
            this_view.collection.fetch({
                data:data,
                url: config.get('api_base') + '/linked_services/' + this_view.service + '/find_friends/',
                success: function(collection, response){
                    this_view.xhr = null;
                    this_view.$el.removeClass('loading');
                    if(response.error){
                        var next = window.location.href;
                        if(response.error.code == 30){
                            link_service('twitter', window.location.href);
                        }else if(response.error.code == 20){
                            link_service('facebook', window.location.href);
                        }
                    }
                }
            });
        }, 300 );
    }
});

});
