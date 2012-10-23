/*global _  define require */
define(['config', 'views/base/page', 'collections/photo', 'views/components/thumbnail', 'auth', 'utils/local_storage', 'utils/string'],
function(config, page_view, photo_collection, thumbnail, auth, local_storage, string_utils){
return page_view.extend({

    post_initialize: function(){
        this.collection = new photo_collection();
        this.collection.url = config.get('api_base') + "/search/";
        this.collection.data = {
            sort:"weighted_score",
            n:20
        };

        this.list_view = new thumbnail({
            collection: this.collection,
            el: $('.x-thumbs'),
            back: "Popular"
        });

        this.time_period = null;
    },

    post_activate: function(){
        this.collection.reset();
        this.list_view.$el.empty();
        this.change_page();
        this.update_list();
    },

    events: {
        "click .x-timeframe a":"update_list"
    },

    get_override_tab: function(){ return 'discover'; },

    update_list: function( e ){
        $.mobile.showPageLoadingMsg();

        var click = !!(e && e.currentTarget);
        if (click){
            this.time_period = e.currentTarget.id.replace( 'popular-', '' );
            local_storage.save( "popular-time", this.time_period );
        }else{
            this.time_period = local_storage.get( "popular-time" ) || 'time-all';
        }

        switch (this.time_period){
            case 'time-today':
                var today = new Date();
                today.setMilliseconds( today.getMilliseconds() - (24*60*60*1000) );
                this.collection.data.min_date = string_utils.date_to_snapr_format(today, 'UTC');
                break;
            case 'time-week':
                var day = new Date();
                day.setMilliseconds( day.getMilliseconds() - (7*24*60*60*1000) );
                this.collection.data.min_date = string_utils.date_to_snapr_format(day, 'UTC');
                break;
            case 'time-all':
                if (this.collection.data.min_date){
                    delete this.collection.data.min_date;
                }
        }

        this.update_time_buttons();

        this.collection.fetch();
    },

    update_time_buttons: function(){
        var id_map = {
            'time-today': ".x-time-today",
            'time-week': ".x-time-week",
            'time-all': ".x-time-all"
        };

        this.$( ".x-timeframe a" ).removeClass( "ui-btn-active" );
        this.$( id_map[this.time_period] ).addClass( "ui-btn-active" );
    }
});

});
