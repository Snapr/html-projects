/*global _  define require */
define(['utils/local_storage', 'native'], function(local_storage, native){
var alerts = {};
alerts.notification = function (title, text, callback) {
    var context = this;
    if(local_storage.get("appmode") == "iphone") {
        var par = {
            "title": title,
            "otherButton1": "OK",
            "alertID": 0
        };
        if(text) {
            par.message = text;
        }
        native.pass_data("snapr://alert?" + $.param(par));
    } else {
        if(text) {
            title = title + ': ' + text;
        }
        alert(title);
        if(_.isFunction(callback)) {
            $.proxy(callback, context)();
        }
    }
};

// what the app calls after an approve
alerts.tapped_action = function(alertID, buttonIndex) {
    alerts.tapped_action.alerts[alertID][buttonIndex]();
    delete alerts.tapped_action.alerts[alertID];
};
alerts.tapped_action.alerts = {};
alerts.tapped_action.counter = 1;
alerts.tapped_action.add = function (yes, no) {
    var id = alerts.tapped_action.counter++;
    alerts.tapped_action.alerts[id] = {
        '-1': yes,
        '0': no
    };
    return id;
};
window.tapped_action = alerts.tapped_action;

alerts.approve = function (options) {
    var context = this;
    options = _.extend({
        'title': 'Are you sure?',
        'yes': 'Yes',
        'no': 'Cancel',
        'yes_callback': $.noop,
        'no_callback': $.noop
    }, options);

    if(local_storage.get("appmode") == 'iphone') {
        var actionID = alerts.tapped_action.add(options.yes_callback, options.no_callback);
        native.pass_data('snapr://action?' + $.param({
            'title': options.title,
            'destructiveButton': options.yes,
            'cancelButton': options.no,
            'actionID': actionID
        }));
    } else {
        if(confirm(options.title)) {
            $.proxy(options.yes_callback, context)();
        } else {
            $.proxy(options.no_callback, context)();
        }
    }
};

return alerts;
});
