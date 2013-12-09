define(['views/share'], function(share_view){
    return share_view.extend({

        share: function(){
            if(!this.is_sharing()){
                analytics.trigger('skip_sharing');
                window.location.hash = this.back_url || '#';
                return;
            }

            $.mobile.loading('show');
            switch(this.photo_source){
                case 'path':
                    this.share_app();
                    break;
                case 'server':
                    this.share_basic();
                    break;
                case 'input':
                    this.share_xhr();
                    break;
                case 'fx':
                    this.share_fx();
                    break;
            }
        }

    });
});