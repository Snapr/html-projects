/*global _ Route define require */
define(['views/base/dialog', 'jquery', 'validate'], function(dialog_view, $){
snapr.views.join_snapr = dialog_view.extend({

    initialize: function()
    {
        snapr.views.dialog.prototype.initialize.call( this );

        this.change_page({
            transition: this.transition
        });

        this.$('.linked-message').toggle(!!(this.options.query && this.options.query.linked));

        this.validator = $("#join-dialog").validate({
            //debug: true,

            errorClass: "x-invalid",
            validClass: "x-valid",

            highlight: function (element, errorClass, validClass) {
                $(element).parent().addClass(errorClass).removeClass(validClass);
            },
            unhighlight: function (element, errorClass, validClass) {
                $(element).parent().removeClass(errorClass).addClass(validClass);
            },

            errorElement: "li",
            errorPlacement: function(error, element) {
                error.insertAfter( element.parent("li"));
            },
            // HAXXY: this is not a validate option (yet) but we will add it to the validator once created
            errors: function(a,b,c) {
                // override the function for returning the error elements to not return the actual fields
                return $( this.settings.errorElement + "." + this.settings.errorClass+":not(.ui-li)", this.errorContext );
            },

            rules: {
                username:{
                    required: true,
                    minlength: 2,
                    maxlength: 15,
                    alphanum_: true,
                    snapr_username: {
                        beforeSend: function(){
                            $('#join-dialog-username').parent().addClass('x-validating').removeClass('x-valid x-invalid');
                        },
                        complete: function(){
                            $('#join-dialog-username').parent().removeClass('x-validating');
                        }
                    }
                },
                password: {
                    required: true,
                    minlength: 6
                },
                email: {
                    required: true,
                    email: true
                }
            },
            messages: {
                username:{
                    required: "Please choose a username",
                    minlength: "Username must be more than 2 letters",
                    maxlength: "Username must be less than 16 letters",
                    alphanum_: "Username must contain only letters, numbers and underscore",
                    snapr_username: "Sorry, this username is not available"
                    //snapr_username: (params['snapr_username'] && window.twitter_token) ? "Unfortunately someone on Snapr already has your Twitter name! Please enter a new username" : "Sorry, this username is not available"
                },
                password:{
                    required: "Please choose a password",
                    minlength: "Your password must be at least 6 characters"
                },
                email:{
                    required: "We need your email address to contact you",
                    email: "Your email address must be in the correct format"
                }
            }
        });
        // HAXXY: errors is not an option of the validate method, here we actually apply it
        this.validator.errors = this.validator.settings.errors;

        if(this.options.query && this.options.query.twitter_name){
            $('#join-dialog-username').val(this.options.query.twitter_name).valid();
        }else{
            $('#join-dialog-username').val("");
        }

        this.$('.twitter-button').toggle(!(this.options.query && this.options.query.twitter_name));
    },

    events: {
        "submit #join-dialog": "join",
        "click .x-back": "back",
        "click .twitter-button": 'twitter_login'
    },

    join: function(){
        $('.x-join-btn').x_loading();
        var new_user = new snapr.models.user_settings();
        new_user.data = {
           username: this.$el.find("#join-dialog-username").val(),
           password: this.$el.find("#join-dialog-password").val(),
           email: this.$el.find("#join-dialog-email").val(),
           client_id: snapr.client_id
        };

        if(this.options.query && this.options.query.twitter_token){
            new_user.data.twitter_token = this.options.query.twitter_token;
        }

        var join_snapr_view = this;

        // these options will be triggered on login (after successful join)
        var login_options = {
            success: function()
            {
                // empty all the forms
                join_snapr_view.$el.find("#join-dialog-username").val('');
                join_snapr_view.$el.find("#join-dialog-password").val('');
                join_snapr_view.$el.find("#join-dialog-email").val('');
                // go back to home screen
                Route.navigate('#/join-success/');
            },
            error: function()
            {
                console.error('error on login after successful join');
            },
            complete: function(){
                $('.x-join-btn').x_loading(false);
            }
        };
        // these options will be triggered on join
        var join_options = {
            success: function()
            {
                snapr.auth.get_token( new_user.data.username, new_user.data.password, login_options );
            },
            error: function( e )
            {
                $('.x-join-btn').x_loading(false);
                console.error( "error", e );
            }
        };

        // save creates a new user
        new_user.save({}, join_options);
    },

    twitter_login: function(){
        Route.navigate( "#/twitter-xauth/?signin=true" );
    }
});

$.validator.addMethod("alphanum_", function(value, element) {
    return this.optional(element) || /^[0-9a-z_]+$/i.test(value);
}, "Letters, numbers and _ only please");

$.validator.addMethod("snapr_username",
    function(value, element, param) {
        if (this.optional(element))
            return "dependency-mismatch";

        var previous = this.previousValue(element);
        if (!this.settings.messages[element.name])
        this.settings.messages[element.name] = {};
        previous.originalMessage = this.settings.messages[element.name].snapr_username;
        this.settings.messages[element.name].snapr_username = previous.message;

        param = typeof param == "string" && {
            url: param
        } || param;

        if (previous.old !== value) {
            previous.old = value;
            var validator = this;
            this.startRequest(element);
            var data = {};
            data[element.name] = value;
            $.ajax($.extend(true, {
                url: snapr.api_base + '/user/validate/',
                mode: "abort",
                port: "validate" + element.name,
                dataType: "jsonp",
                data: data,
                success: function(response) {
                    validator.settings.messages[element.name].snapr_username = previous.originalMessage;
                    var valid = response.success;
                    if (valid) {
                        var submitted = validator.formSubmitted;
                        validator.prepareElement(element);
                        validator.formSubmitted = submitted;
                        validator.successList.push(element);
                        validator.showErrors();
                    } else {
                        var errors = {};
                        errors[element.name] = response.error.message;
                        validator.showErrors(errors);
                    }
                    previous.valid = valid;
                    validator.stopRequest(element, valid);
                }
            },
            param));
            return "pending";
        } else if (this.pending[element.name]) {
            return "pending";
        }
        return previous.valid;
    });

return snapr.views.join_snapr;
});
