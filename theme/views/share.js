define(['views/share', '../../theme/views/material'], function(share_view, material){
    return share_view.extend({

        events: {
        'click .x-photo': 'show_lightbox',
        'click .x-lightbox': 'hide_lightbox',
        'change .x-status': 'toggle_status',
        'click .x-location': 'toggle_location_sharing',
        'change .x-photo-sharing input': 'toggle_sharing',
        'change .x-photo-sharing select': 'toggle_sharing',
        'vclick .x-photo-sharing .ui-disabled': 'share_alert',
        'click .x-photo-toggle': 'toggle_photo',
        'change .x-description': 'update_description',
        'submit form': 'append_selected_tags'
    },

        append_selected_tags : function(){

            var description = $(".s-textarea").val();
            var tag = $(".material-choice option:selected").val();
            if(tag === "Select Material") { //value if there is no tag
                alert("You have to select a material, my friend");
            }else {
                $(".s-textarea").val(description + ' ' + tag);
                this.share();
            }
        }

    });
});



