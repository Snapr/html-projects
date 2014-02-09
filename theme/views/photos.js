    define(['views/photos', 'views/components/feed'], function(photos_view, feed){
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
                        self.title = T("Photos");
                    }

                    self.replace_from_template({title: self.title}, ['.x-title']).enhanceWithin();

                    self.photos = new feed({
                        el: self.$('.x-photos'),
                        tabs: [{
                            title: self.title,
                            query: query,
                            list_style: query.list_style || undefined
                        }],
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