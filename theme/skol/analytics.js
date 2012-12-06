/*global _ $ define theme_templates theme_views */
define(['utils/analytics', 'auth'], function(analytics, auth){

    //accountId      tracking Code Server URL                            env   domain
    //ABI-Skol_prod  UA-36371583-1 gekko-analytics.appspot.com           prod  abi-skol_prod
    //ABI-Skol_stage UA-36371583-3 gekko-analytics-test.appspot.com      Stage abi-skol_stage
    //abi-skol_test  UA-36371583-4 test.gekko-analytics-test.appspot.com Test  abi-skol_test

    var base = 'http://test.gekko-analytics-test.appspot.com/api/abi-skol_test/gg-analytics/v10/',
        accountId = 'abi-skol_test';

    function track_event(category, event){
        $.ajax({
            url: base + 'trackEvent/',
            data: {
                category: category,  // String  - category value
                event: 'snapr_' + event,  // String  - event value
                //label: '',  // String  - label value - optional
                //value: '',  // Integer - integer value - optional
                accountId: accountId,
                userId: username_to_number(auth.get('snapr_user'))
            }
        });
    }


    track_event('Launch Icon', 'Open App');

    analytics.on('launch_camera', function(){
        track_event('Shoot', 'Photo Tap');
    });
    analytics.on('launch_photo_library', function(){
        track_event('Shoot', 'Camera Roll Tap');
    });
    analytics.on('share', function(options){
        console.log(options);
        track_event('Share', 'Tap Share');
        if(options.facebook_album){
            track_event('Share', 'Tap Share to Facebook');
        }
        if(options.tweet){
            track_event('Share', 'Tap Share to Twitter');
        }
        if(options.foursquare_checkin){
            track_event('Share', 'Tap Share to Foursquare');
        }
    });

    analytics.on('page_load', function(page){
        $.ajax({
            url: base + 'trackPage/',
            data: {
                pageName: 'snapr_'+page.options.name,
                userId: username_to_number(auth.get('snapr_user')),
                accountId: accountId
            }
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
