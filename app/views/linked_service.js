tripmapper.views.linked_service = Backbone.View.extend({
    linked_service_template: _.template( $('#linked-service-template').html() ),
    add_service_template: _.template( $('#add-linked-service-template').html() ),
    render: function(){
        if(this.model){
            this.el = this.linked_service_template( {service: this.model} );
        }else{
            if(this.provider){
                this.el = this.add_service_template( {provider:this.provider} )
            }
        }
        return this;
    }
});