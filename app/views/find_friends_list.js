// abstract base class for both twitter and facebook

/*global _  define require */
define(['config', 'views/base/page', 'collections/user', 'views/people_li', 'views/linked_service', 'views/components/no_results',
    'utils/link_service', 'auth'],
function(config, page_view, user_collection, people_li, link_service_view, no_results, link_service, auth){

var find_friends = page_view.extend({

    post_initialize: function(){
        this.people_li_template = this.get_template('components/person');

        this.collection = new user_collection();
    },

    post_activate: function(options){

        this.$(".x-people-list").empty();
        this.$(".x-helper-content").empty();
        $.mobile.hidePageLoadingMsg();

        this.change_page();

        this.service = this.options.service;

        if (options.query.username){
            auth.user_settings.cache_bust();
        }

        this.search();
    },

    dialog_closed: function(){
        this.$(".x-people-list").empty();
        this.search();
    },

    events: {
        "keyup input": "search",
        "vclick .x-input-clear": "search"
    },

    render: function(){
        var people_list = this.$(".x-people-list");
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
            this_view.$el.addClass('x-loading');
            this_view.collection.fetch({
                data:data,
                url: config.get('api_base') + '/linked_services/' + this_view.service + '/find_friends/',
                success: function(collection, response){
                    var people_list = this_view.$(".x-people-list").empty();
                    var helper_content = this_view.$(".x-helper-content").empty();
                    this_view.xhr = null;
                    this_view.$el.removeClass('x-loading');

                    if(response.error){
                        var button = new link_button();
                        if(response.error.type == 'linked_service.twitter.no_account'){
                            button.provider = 'twitter';
                            helper_content.append( button.render().$el ).trigger('create');
                            return;
                        }else if(response.error.type == 'linked_service.facebook.no_account'){
                            button.provider = 'facebook';
                            helper_content.append( button.render().$el ).trigger('create');
                            return;
                        }
                    }

                    this_view.render();
                }
            });
        }, 300 );
    }
});

var link_button = link_service_view.extend({
    initialize: function(){
        this.unlinked_service_template = this.get_template('components/linked_services/find_friends_unlinked');
    }
});

return find_friends;

});
