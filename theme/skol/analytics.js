/*global _ $ define auth */
// auth is globally available and importing it here would result in a circ. dependency
define(['utils/analytics'], function(analytics){

    //accountId      tracking Code Server URL                            env   domain
    //ABI-Skol_prod  UA-36371583-1 gekko-analytics.appspot.com           prod  abi-skol_prod
    //ABI-Skol_stage UA-36371583-3 gekko-analytics-test.appspot.com      Stage abi-skol_stage
    //abi-skol_test  UA-36371583-4 test.gekko-analytics-test.appspot.com Test  abi-skol_test

    var base = 'http://test.gekko-analytics-test.appspot.com/api/abi-skol_test/gg-analytics/v10/',
        accountId = 'abi-skol_test';

    function track_event(event){
        var data = {
            category: 'snapr-ibeats',  // String  - category value
            event: 'snapr_' + event,  // String  - event value
            //label: '',  // String  - label value - optional
            //value: '',  // Integer - integer value - optional
            accountId: accountId
        };
        if(window.auth.get('snapr_user')){
            data.userId = username_to_number(window.auth.get('snapr_user'));
        }
        $.ajax({
            url: base + 'trackEvent/',
            data: data
        });
    }


    //track_event('Open App');

    analytics.on('launch_camera', function(){
        track_event('Photo Tap');
    });
    analytics.on('launch_photo_library', function(){
        track_event('Camera Roll Tap');
    });
    analytics.on('share', function(options){
        console.log(options);
        track_event('Tap Share');
        if(options.facebook_album){
            track_event('Tap Share to Facebook');
        }
        if(options.tweet){
            track_event('Tap Share to Twitter');
        }
        if(options.foursquare_checkin){
            track_event('Tap Share to Foursquare');
        }
    });

    analytics.on('page_load', function(page){
        var data = {
            pageName: 'snapr_'+page.options.name,
            accountId: accountId
        };
        if(window.auth.get('snapr_user')){
            data.userId = username_to_number(window.auth.get('snapr_user'));
        }
        $.ajax({
            url: base + 'trackPage/',
            data: data
        });
    });

    function username_to_number(username){
        var chars = "abcdefghijklmnopqrstuvwxyz_0123456789",
            base = chars.length,
            number = 0,
            i = 0;

        while(i < username.length){
            number += Math.pow(base,i) * (chars.indexOf(username.charAt(i++))+1);
        }

        return number - 1400;  // make them all a little smaller (aaa ~= 1400, none can be less)
    }

    return true;
});
