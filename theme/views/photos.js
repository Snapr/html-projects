/*global _, define, require, T */
define(['config', 'views/base/page', '../../theme/views/feed'], function(config, page_view, feed){
    return page_view.extend({

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
                    }else if (query.not_tagged){
                        self.title = T("Nearby & Not Taken");
                    }else if (query.favorited_by){
                        self.title = T("Favorites");
                    }else if (query.spot && query.venue_name){
                        self.title = '@ '+query.venue_name;
                    }else if (query.radius){
                        self.title = T("Nearby");
                    }else if (query.sort == 'weighted_score' || query.sort == 'score'){
                        self.title = T("Popular");
                    }else{
                        self.title = T("All");
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

            },

            events:{
                'click .x-menu-button': 'open_menu',
                'click .ui-header' : 'scrollTop'
            },

            open_menu : function(){
                $('.x-side-menu').panel('open');
            },

            scrollTop : function() {
                $("html, body").animate({ scrollTop: 0 }, "fast");

            }
});
});
