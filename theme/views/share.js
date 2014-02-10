define(['views/share', '../../theme/js/material'], function(share_view, material){
    return share_view.extend({

        events: function(){
              return _.extend({},share_view.prototype.events,{
                  'change .material-choice' : 'append_selected_tags_to_material_box',
              });
           },

        append_selected_tags_to_material_box: function() {

            alert('Coming Soon');
        }

    });

});