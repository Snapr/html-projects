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
                        $('.aj-radius-btn').hide();
                    }else if (query.favorited_by){
                        self.title = T("Favorites");
                    }else if (query.spot && query.venue_name){
                        self.title = '@ '+query.venue_name;
                    }else if (query.sort == 'weighted_score' || query.sort == 'score'){
                        self.title = T("Popular");
                    }else if (query.sort == 'weighted_score' || query.sort == 'score'){
                        self.title = T("Popular");
                    }else if (query.photo_id){ //tc-added
                        self.title = T("Browse");
                        $('.aj-radius-btn').hide();
                        $('.aj-refresh').hide();
                    }else if (query.radius) {
                        self.title = T("Nearby");
                    }else if (query.not_tagged){
                        self.title = T("Not Taken");
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

                $('.x-side-menu [data-slug="browse"]').addClass('ui-btn-active');
                $('.browse-btn').addClass('ui-btn-active');
                $('.map-btn').removeClass('ui-btn-active');

            },

            events: function(){
                return _.extend({},photos_view.prototype.events,{
                    'click .aj-refresh' : 'refresh',
                    'click .aj-distance' : 'change_radius',
                    'click .x-title' : 'scrollTop',
                    'click .x-menu-button': 'open_menu'
                });
            },

            refresh: function() {
                this.post_activate(this.options);
            },

            change_radius: function(ev) {
                var distance = $(ev.target).attr('data-distance');
                if (distance === "all"){
                    delete this.options.query.location;
                    delete this.options.query.radius;
                } else {
                    this.options.query.radius = parseInt(distance, 0);
                }
                this.refresh();
                $(ev.target).addClass('ui-btn-active');
                $(ev.target).siblings().removeClass('ui-btn-active');
            },

            scrollTop : function() {
                $("html").animate({ scrollTop: 0 }, "fast");
            },

            open_menu : function(){
                $('.x-side-menu').panel('open');
            }


        });
    });