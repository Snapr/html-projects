snapr.settings = {
    'dev': {
        'base_url': "http://dev.sna.pr",
        'client_id': "48611a3a325dc884c9d1722002be43ff",
        'client_secret': "a5b072ed71e89a4f0982944a4dd82d94",
        'app_group': "pink-nation",
        'public_group': "pink-nation-featured"
    },
    'dev-android': {
        'base_url': "http://dev.sna.pr",
        'client_id': "31d88a2947e7598bc4a5c4c474246f14",
        'client_secret': "50b44b311e1a5d0e1f5281a7de637fd4",
        'app_group': "pink-nation-android",
        'public_group': "pink-nation-featured"
    },
    'live': {
        'base_url': "http://sna.pr",
        'client_id': "5a412fe2ed7bebf10fb10683d99a79e0",
        'client_secret': "379dfae125538c65b20f2951353da650",
        'app_group': "pink-nation",
        'public_group': "pink-nation-featured"
    },
    'live-android': {
        'base_url': "http://sna.pr",
        'client_id': "ca40e3acc8e6867303d9bd0ae3ece6de",
        'client_secret': "7e5b7a0a9682b70fba8d1321f9123be6",
        'app_group': "pink-nation-android",
        'public_group': "pink-nation-featured"
    },
    'local': {
        'base_url': "http://localhost:8001",
        'client_id': "test",
        'client_secret': "secret",
        'app_group': "pink-nation",
        'public_group': "pink-nation-featured"
    },
    'default': {
        'base_url': "http://dev.sna.pr",
        'client_id': "48611a3a325dc884c9d1722002be43ff",
        'client_secret': "a5b072ed71e89a4f0982944a4dd82d94",
        'app_group': "pink-nation",
        'public_group': "pink-nation-featured"
    }
};

snapr.constants = {};
snapr.constants.default_zoom = 15;
snapr.constants.feed_count = 12;

snapr.constants.share_redirect = false;
// set to hash url to redirect after successful upload/share eg:
// snapr.constants.upload_redirect = "#/uploading/";
// if false, redirects to user feed

// Backbone.emulateHTTP = true;
// Overriding sync to make this a jsonp app
Backbone.sync = function (method, model, options) {

    // console.warn( "sync", method, model, options )
    // Helper function to get a URL from a Model or Collection as a property
    // or as a function.
    // sends the method as a parameter so that different methods can have
    // different urls.
    var getUrl = function (object, method) {
            if(!(object && object.url)) return null;
            return _.isFunction(object.url) ? object.url(method) : object.url;
        };

    // map RESTful methods to our API
    var method_map = {
        'create': 'POST',
        'update': 'POST',
        'delete': 'POST',
        'read': 'GET'
    };

    if(snapr.auth && snapr.auth.get('access_token')) {
        // if there is no .data attribute on the model set it from the model's id
        // or just pass an empty object
        model.data = model.data && _.extend(model.data, model.attributes) || model.attributes || model.get('id') && {
            id: model.get('id')
        } || {};
        model.data.access_token = snapr.auth.get('access_token');
    }

    if(snapr.app_group && !model.data.app_group) {
        _.extend(model.data, {
            app_group: snapr.app_group
        });
    }

    // our hack to get jsonp to emulate http methods by appending them to the querystring
    if(method_map[method] != 'GET') {
        var meth = '&_method=' + method_map[method];
    } else {
        var meth = '';
    }

    var url = getUrl(model, method);

    $.ajax({
        url: url + '?' + $.param(model.data || {}) + meth,
        type: 'GET',
        // data is sent in the url only
        data: null,
        dataType: options.dataType || 'jsonp',
        processData: false,
        success: options.success,
        error: options.error
    });
};

Number.prototype.zeroFill = function (width) {
    width -= this.toString().length;
    if(width > 0) {
        return new Array(width + (/\./.test(this) ? 2 : 1)).join('0') + this;
    }
    return this.toString();
};

Array.prototype.human_list = function () {
    if(this.length == 1) {
        return this[0];
    }
    copy = this.slice(0);
    text = copy.pop();
    text = copy.pop() + ' and ' + text;
    while(copy.length) {
        text = copy.pop() + ', ' + text;
    }
    return text;
};


// defined in index.html
// snapr = {};
// snapr.models = {};
// snapr.routers = {};
// snapr.base_url = "https://sna.pr";
// snapr.api_base = snapr.base_url + "/api";
// snapr.access_token_url = snapr.base_url + "/ext/oauth/access_token/";



// store some info about the browser
snapr.info = {};
snapr.info.supports_local_storage = (function () {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch(e) {
        return false;
    }
})();

snapr.info.upload_count = 0;
snapr.info.upload_mode = "On";
snapr.info.upload_paused = false;
snapr.info.geolocation_enabled = true;
snapr.info.current_view = null;

// used to hold upload progress views
snapr.pending_uploads = {};

snapr.auth = new snapr.models.auth();
snapr.auth.get_locally();

snapr.utils = {};
snapr.utils.date_to_snapr_format = function (d) {
    return d.getFullYear() + '-' + (d.getMonth() + 1).zeroFill(2) + '-' + d.getDate().zeroFill(2) + ' 00:00:00';
};
snapr.utils.save_local_param = function (key, value) {
    if(snapr.info.supports_local_storage) {
        localStorage.setItem(key, value);
    } else {
        $.cookie(key, value);
    }

    if(key == "appmode") {
        $("body").addClass("appmode").addClass("appmode-" + value);
    }
};

// defined differently so the function is hoisted for earlier use
snapr.utils.get_local_param = get_local_param;
function get_local_param (key) {
    if(snapr.info.supports_local_storage) {
        return localStorage.getItem(key);
    } else {
        return $.cookie(key);
    }
}
snapr.utils.delete_local_param = function (key) {
    if(snapr.info.supports_local_storage) {
        localStorage.removeItem(key);
    } else {
        $.cookie(key, null);
    }
};

// defined differently so the function is hoisted for earlier use
snapr.utils.get_query_params = get_query_params;

function get_query_params(query) {
    var params = {};
    if(query && query.indexOf('=') > -1) {
        _.each(query.split('&'), function (part) {
            var kv = part.split('='),
                key = kv[0],
                value = kv[1];
            if(kv[0] == "zoom") {
                params[key] = parseInt(unescape(value));
            } else {
                if(_.indexOf(["access_token", "snapr_user"], key) > -1) {
                    var obj = {};
                    obj[kv[0]] = unescape(kv[1]);
                    snapr.auth.set(obj);
                } else if(_.indexOf(["snapr_user_public_group", "snapr_user_public_group_name", "appmode", "new_user", "demo_mode", "environment"], kv[0]) > -1) {
                    snapr.utils.save_local_param(key, value);
                } else {
                    key = unescape(key);
                    if(key in params) {
                        if(!_.isArray(params[key])) {
                            params[key] = [params[key]];
                        }
                        params[key].push(value);
                    } else {
                        params[key] = unescape(value);
                    }
                }
            }
        });
    }

    env = snapr.utils.get_local_param('environment');
    console.log('env', env);
    if (_.has(snapr.settings, env)){
        var settings = snapr.settings[env];
    }else{
        var settings = snapr.settings['default'];
    }
    _.each(settings, function(value, key){
        snapr[key] = value;
    });

    snapr.api_base = snapr.base_url + "/api";
    snapr.access_token_url = snapr.base_url + "/ext/oauth/access_token/";

    return params;
}
// alert/confirm replacements
snapr.utils.notification = function (title, text, callback) {
    var context = this;
    if(snapr.utils.get_local_param("appmode") == "iphone") {
        var par = {
            "title": title,
            "otherButton1": "OK",
            "alertID": 0
        };
        if(text) {
            par.message = text;
        }
        pass_data("snapr://alert?" + $.param(par));
    } else {
        if(text) {
            title = title + ' ' + text;
        }
        alert(title);
        if(_.isFunction(callback)) {
            $.proxy(callback, context)();
        }
    }
};

snapr.utils.approve = function (options) {
    var context = this;
    options = _.extend({
        'title': 'Are you sure?',
        'yes': 'Yes',
        'no': 'Cancel',
        'yes_callback': $.noop,
        'no_callback': $.noop
    }, options);

    if(snapr.utils.get_local_param("appmode") == 'iphone') {
        var actionID = tapped_action.add(options.yes_callback, options.no_callback);
        pass_data('snapr://action?' + $.param({
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
// what the app calls after an approve
function tapped_action(alertID, buttonIndex) {
    tapped_action.alerts[alertID][buttonIndex]();
    delete tapped_action.alerts[alertID];
}
tapped_action.alerts = {};
tapped_action.counter = 1;
tapped_action.add = function (yes, no) {
    var id = tapped_action.counter++;
    tapped_action.alerts[id] = {
        '-1': yes,
        '0': no
    };
    return id;
};

snapr.utils.require_login = function (funct) {
    return function (e) {
        if(!snapr.auth.has('access_token')) {
            if(e) {
                e.preventDefault();
            }
            Route.navigate('#/login/?message=Sorry, you need to log in first.', true);
        } else {
            $.proxy(funct, this)(e);
        }
    };
};
snapr.utils.get_photo_height = function (orig_width, orig_height, element) {
    // this depends on the padding - bit of a hack
    var aspect = orig_width / orig_height,
        width = $(element).eq(0).innerWidth() - 40;
    //console.warn("orig_width: " + orig_width + " orig_height: " + orig_height + " width:" + width + " aspect:" + aspect);
    return width / aspect;
};

var opts = {
    lines: 12,
    // The number of lines to draw
    length: 7,
    // The length of each line
    width: 4,
    // The line thickness
    radius: 10,
    // The radius of the inner circle
    speed: 1,
    // Rounds per second
    trail: 60,
    // Afterglow percentage
    shadow: false // Whether to render a shadow
};


$.fn.spin = function (opts) {
    this.each(function () {
        var $this = $(this),
            spinner = $this.data('spinner');

        if(spinner) spinner.stop();
        if(opts !== false) {
            opts = $.extend({
                color: $this.css('color'),
                width: 4,
                length: 7
            }, opts);
            spinner = new Spinner(opts).spin(this);
            $this.data('spinner', spinner);
        }
    });
    return this;
};



snapr.routers = Backbone.Router.extend({
    routes: {
        "/login/": "login",
        "/login/?*query_string": "login",
        "/logout/": "logout",
        "/join/": "join_snapr",
        "/join/?*query_string": "join_snapr",
        "/upload/": "upload",
        "/upload/?*query_string": "upload",
        "/uploading/": "uploading",
        "/uploading/?*query_string": "uploading",
        "/photo-edit/?*query_string": "photo_edit",
        "/love-it/?*query_string": "love_it",
        "/my-account/": "my_account",
        "/my-account/?*query_string": "my_account",
        "/linked-services/": "linked_services",
        "/linked-services/?*query_string": "linked_services",
        "/connect/": "connect",
        "/connect/?*query_string": "connect",
        "/limbo/": "limbo",
        "/limbo/?*": "limbo",
        "/feed/": "feed",
        "/feed/?*query_string": "feed",
        "/pink-hearts/": "pink_hearts",
        "/pink-hearts/?*query_string": "pink_hearts",
        "/": "home",
        "?*query_string": "home",
        "/?*query_string": "home",
        "*path": "home"
    },

    feed: function (query_string) {
        topbar(false);
        var query = snapr.utils.get_query_params(query_string);
        snapr.info.current_view = new snapr.views.feed({
            query: query,
            el: $("#feed")
        });
        snapr_cmCreatePageviewTag("VSPINK_APP_PICS_FEAT_PICS_P", "VSPINK_APP_PICS_P");
        snapr_cmCreateManualLinkClickTag('cm_re=spring2012-_-sub-_-see_featured_pics', 'SEE FEATURED PICS', 'VSPINK_APP_PICS_LP_P');
    },

    pink_hearts: function (query_string) {
        snapr_cmCreateManualLinkClickTag('cm_re=spring2012-_-sub-_-menu_list_pink_hearts', 'MENU LIST PINK HEARTS', 'VSPINK_APP_MENU_P');
        topbar(false);
        snapr.utils.get_query_params(query_string);
        snapr.info.current_view = new snapr.views.pink_hearts({
            el: $("#pink-hearts")
        });
        snapr_cmCreatePageviewTag("VSPINK_APP_PICS_PINK_HEARTS_MAIN_PAGE_P", "VSPINK_APP_PICS_PINK_HEARTS_P");
        snapr_cmCreateManualLinkClickTag('cm_re=spring2012-_-sub-_-pink_hearts', 'PINK HEARTS', 'VSPINK_APP_PICS_LP_P');
    },

    home: function (query_string) {
        console.warn('go home');
        topbar(true);
        snapr.utils.get_query_params(query_string);
        snapr.info.current_view = new snapr.views.home({
            el: $('#home')
        });
        console.log("VSPINK_APP_PICS_LP_P", "VSPINK_APP_PICS_P");
        snapr_cmCreatePageviewTag("VSPINK_APP_PICS_LP_P", "VSPINK_APP_PICS_P");
    },

    login: function (query_string) {
        console.warn('go to login');
        topbar(false);
        var query = snapr.utils.get_query_params(query_string);
        snapr.info.current_view = new snapr.views.login({
            el: $('#login'),
            query: query
        });
    },

    logout: function (query_string) {
        topbar(false);
        snapr.utils.get_query_params(query_string);
        if(snapr.auth) {
            snapr.auth.logout();
        } else {
            snapr.auth = new snapr.models.auth;
        }
        window.location.hash = "";
    },

    join_snapr: function (query_string) {
        topbar(false);
        snapr.utils.get_query_params(query_string);
        snapr.info.current_view = new snapr.views.join_snapr({
            el: $("upload")
        });
    },

    upload: function (query_string) {
        //topbar(false);
        snapr.utils.get_query_params(query_string);
        snapr.info.current_view = new snapr.views.upload({
            el: $("#upload")
        });
    },

    uploading: function (query_string) {
        //topbar(false);
        var query = snapr.utils.get_query_params(query_string);
        snapr.info.current_view = new snapr.views.uploading({
            el: $("#uploading"),
            query: query
        });
        snapr_cmCreatePageviewTag("VSPINK_APP_PICS_LP_P", "VSPINK_APP_PICS_FILTERS_UPLOAD_P");
    },

    photo_edit: function (query_string) {
        //topbar(false);
        var query = snapr.utils.get_query_params(query_string);
        snapr.info.current_view = new snapr.views.photo_edit({
            el: $("#photo-edit"),
            query: query
        });
        snapr_cmCreatePageviewTag("VSPINK_APP_PICS_LP_P", "VSPINK_APP_PICS_FILTERS_P");
    },

    love_it: function (query_string) {
        //topbar(false);
        var query = snapr.utils.get_query_params(query_string);
        snapr.info.current_view = new snapr.views.love_it({
            el: $("#love-it"),
            query: query
        });
        snapr_cmCreateConversionEventTag('APP_FILTERS_UPLOAD_IMAGE', 2, 'VSPINK_APP_PICS_FILTERS_P');
        snapr_cmCreatePageviewTag("VSPINK_APP_PICS_LP_P", "VSPINK_APP_PICS_FILTERS_P");
    },

    my_account: function (query_string) {
        //topbar(false);
        snapr.utils.get_query_params(query_string);
        snapr.info.current_view = new snapr.views.my_account({
            el: $("#my-account")
        });
    },

    linked_services: function (query_string) {
        //topbar(false);
        var query = snapr.utils.get_query_params(query_string);
        snapr.info.current_view = new snapr.views.linked_services({
            el: $("#linked-services"),
            query: query
        });
    },

    connect: function (query_string) {
        //topbar(false);
        var query = snapr.utils.get_query_params(query_string);
        snapr.info.current_view = new snapr.views.connect({
            el: $("#connect"),
            query: query
        });
    },

    limbo: function (query_string) {
        topbar(false);
        snapr.utils.get_query_params(query_string);
        snapr.info.current_view = new snapr.views.limbo({
            el: $("#limbo")
        });
    }

});

function spinner_start(text) {
    $('.n-centered-loader .text').text(text || '');
    $('body').addClass('n-loading');
}

function spinner_stop() {
    $('body').removeClass('n-loading');
}


// upload/appmode functions
function pass_data(url) {
    window.location = url.replace(/\+/g, '%20');
}

function topbar(show) {
    if(snapr.utils.get_local_param("appmode")) {
        //killing this for now, seems to break things by interupting other scripts..
        // console.warn('about to pass topbar param');
        //pass_data( show ? "snaprkit-parent://topbar/?show=true": "snaprkit-parent://topbar/?show=false" );
        //console.warn('passed topbar param');
    }
}

function upload_progress(data, datatype) {
    // data may be passed as an object or a string as specified via the data_type param
    // defualts to JSON object, if 'json_string' it will be a text string that needs to be parsed..
    // dont foget to convert it before you do anything with it..
    if(datatype == 'json_text') {
        data = JSON.parse(data);
    }

    if(data.uploads.length) {
        if(typeof snapr.info.current_view.upload_progress == "function") {
            snapr.info.current_view.upload_progress(data);
        }
    } else {
        if(snapr.utils.get_local_param("appmode")) {
            pass_data("snapr://upload_progress?send=false");
        }
    }
}

function upload_count(count) {
    snapr.info.upload_count = count;

    if(typeof snapr.info.current_view.upload_count == "function") {
        snapr.info.current_view.upload_count(count);
    }
}

function upload_completed(queue_id, snapr_id) {

    var path = snapr.pending_uploads[queue_id] && snapr.pending_uploads[queue_id].photo && snapr.pending_uploads[queue_id].photo.thumbnail || null;

    if(path) {
        Route.navigate("#/love-it/?shared=true&photo_path=" + path, true);
    } else {
        Route.navigate("#/love-it/?shared=true&photo_id=" + snapr_id, true);
    }

    snapr.pending_uploads[queue_id] && delete snapr.pending_uploads[queue_id];

}

function upload_cancelled(id) {
    if(typeof snapr.info.current_view.upload_cancelled == "function") {
        snapr.info.current_view.upload_cancelled(id);
    }
}

function queue_settings(upload_mode, paused) {
    snapr.info.upload_mode = upload_mode;
    snapr.info.paused = paused;

    if(typeof snapr.info.current_view.queue_settings == "function") {
        snapr.info.current_view.queue_settings(upload_mode, paused);
    }
}

$(".x-launch-camera").live("click", function () {
    snapr_cmCreateConversionEventTag('APP_FILTERS_UPLOAD_IMAGE', 1, 'VSPINK_APP_PICS_FILTERS_P');
    // console.warn("camera");
    if(snapr.utils.get_local_param("appmode")) {
        pass_data("snapr://camera");
        setTimeout(function () {
            Route.navigate('#/limbo/', true);
        }, 600);
    } else {
        Route.navigate('#/upload/', true);
    }
});

$(".x-launch-photo-library").live("click", function () {
    snapr_cmCreateConversionEventTag('APP_FILTERS_UPLOAD_IMAGE', 1, 'VSPINK_APP_PICS_FILTERS_P');
    // console.warn("camera-roll");
    if(snapr.utils.get_local_param("appmode")) {
        pass_data("snapr://photo-library");
        setTimeout(function () {
            Route.navigate('#/limbo/', true);
        }, 600);

    } else {
        Route.navigate('#/upload/', true);
    }
});

$(".x-launch-login-share").live("click", function () {
    // console.warn("camera");
    if(snapr.utils.get_local_param("appmode")) {
        pass_data("snaprkit-parent://launch/?action=login");
    } else {
        Route.navigate('#/login/', true);
    }
});


$(".x-launch-PINK-tell-a-friend").live("click", function () {
    if(snapr.utils.get_local_param("appmode")) {
        pass_data("snaprkit-parent://launch/?action=tell-a-friend");
    } else {
        alert('Tell a Friend is a feature of the Native App Only');
    }
});

$(".x-launch-PINK-info").live("click", function () {
    if(snapr.utils.get_local_param("appmode")) {
        pass_data("snaprkit-parent://launch/?action=info");
    } else {
        alert('App Info is a feature of the Native App Only');
    }
});

$(".x-launch-PINK-logo-action").live("click", function () {
    if(snapr.utils.get_local_param("appmode")) {
        pass_data("snaprkit-parent://launch/?action=logo-clicked");
    } else {
        alert('PINK Menu is a feature of the Native App Only');
    }
});

// end upload/appmode functions
$(function () {
    // initialise router and start backbone
    Route = new snapr.routers;
    Backbone.history.start();
    if(snapr.utils.get_local_param("appmode")) {
        $("body").addClass("appmode").addClass("appmode-" + snapr.utils.get_local_param("appmode"));
    }
    $('.n-centered-loader .spinner').spin({
        lines: 12,
        length: 7,
        width: 4,
        radius: 10,
        speed: 1,
        trail: 60,
        color: '#efefee'
    });
    spinner_stop();
    $(document).trigger('snaprinit');

    function preventScroll(e) {
        e.preventDefault();
    }
    $(document).bind('pagechange', function () {
        $('.no-drag').unbind('touchmove', preventScroll).bind('touchmove', preventScroll);
    });
});


function Query(input) {
    if(typeof (input) == "string") {
        this.query = this.parse(input);
    } else if(typeof (input) == "object") {
        this.query = input;
    }
}

Query.prototype.parse = function (querystring) {
    var params = {};
    $.each(querystring.split('&'), function (i, part) {
        var kv = part.split('='),
            key = unescape(kv[0]),
            value = unescape(kv[1]);
        if(key in params) {
            if(!$.isArray(params[key])) {
                params[key] = [params[key]];
            }
            params[key].push(value);
        } else {
            params[key] = value;
        }
    });
    return params;
};

Query.prototype.toString = function () {
    return $.param(this.query);
};

Query.prototype.remove = function (key) {
    delete this.query[key];
    return this;
};

Query.prototype.get = function (key) {
    return !(key in this.query) && arguments.length > 1 && arguments[1] || this.query[key];
};

Query.prototype.pop = function (key) {
    value = this.get.apply(this, arguments);
    this.remove(key);
    return value;
};

Query.prototype.set = function (key, value) {
    this.query[key] = value;
    return this;
};
