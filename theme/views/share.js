define(['views/share'], function(share_view){
    return share_view.extend({

        events: {
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



