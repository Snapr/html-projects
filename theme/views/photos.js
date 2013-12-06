/*global _  define require */
define(['views/photos','../../theme/views/feed'],
    function(base_view, feed){
        return base_view.extend({

            post_initialize: function(options){
                base_view.prototype.post_initialize.call(this, options);
                console.log('extended view initialized.');

            },

            post_activate: function(options){  var self = this;
                if(!_.isEqual(self.options.query,self.previous_query)){
                    self.change_page();

                    var query = self.options.query;
                    self.previous_query = _.clone(query);

                    if (query.keywords){
                        self.title = '#'+query.keywords;
                    }else if (query.tag){
                        self.title = query.tag;
                    }else if (query.area){
                        self.title = T("Location");
                    }else if (query.favorited_by){
                        self.title = T("Favorites");
                    }else if (query.spot && query.venue_name){
                        self.title = '@ '+query.venue_name;
                    }else if (query.sort == 'weighted_score' || query.sort == 'score'){
                        self.title = T("Popular");
                    }else{
                        self.title = T("Browse");
                    }

                    self.replace_from_template({title: self.title}, ['.x-title']).enhanceWithin();

                    self.photos = new feed({
                        el: self.$('.x-photos'),
                        tabs: [{
                            title: self.title,
                            query: query
                        }],
                        photo_templates: {
                            list: self.get_template(options.list_item_template)
                        }
                    });
                    $.mobile.loading('show');

                }else{
                    self.show_bg_loader();
                    self.photos.render(function(){ self.show_bg_loader(false); });
                    self.change_page();
                }

            }

});
});
