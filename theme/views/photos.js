    define(['views/photos', '../views/feed'], function(photos_view, feed){
        return photos_view.extend({

            //overwriten
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
                    }else if (query.radius){ //tc-added
                        self.title = T("Nearby");
                    }else{
                        self.title = T("All"); //tc-edited
                    }

                    self.replace_from_template({title: self.title}, ['.x-title']).enhanceWithin();

                    self.photos = new feed({
                        el: self.$('.x-photos'),
                        tabs: [{
                            title: self.title,
                            query: query
                        }],
                        photo_templates: { //tc-added
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

            events: function(){
                  return _.extend({},photos_view.prototype.events,{
                    'click .aj-refresh' : 'refresh',
                    'click .ui-header' : 'scrollTop'
                  });
               },

            refresh: function() {
                this.post_activate(this.options);
            },

            scrollTop : function() {
                $("html").animate({ scrollTop: 0 }, "fast");

            },


        });
    });