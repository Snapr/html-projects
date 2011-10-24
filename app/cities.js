var cities = {
    'new-york': {
        'name': 'New York',
        'area': '40.3429,-74.9073,41.0509,-73.052'
    },
    'london': {
        'name': 'London',
        'area': '51.4609,-0.267,51.5335,-0.0351'
    },
    'san-francisco': {
        'name': 'San Francisco',
        'area': '37.6654,-122.6695,37.8499,-122.2057'
    },
    'paris': {
        'name': 'Paris',
        'area': '48.6706,1.91574,49.03479,2.77679'
    },
    'la': {
        'name': 'L.A.',
        'area': '33.17046,-118.93445,34.75812,-116.91571'
    },
    'tokyo': {
        'name': 'Tokyo',
        'area': '35.3201,138.5036,36.0784,140.359'
    },
    'berlin': {
        'name': 'Berlin',
        'area': '52.43404,13.24902,52.57218,13.53398'
    },
    'sydney': {
        'name': 'Sydney',
        'area': '-34.11398,150.85876,-33.67054,151.54472'
    },
    'melbourne': {
        'name': 'Melbourne',
        'area': '-38.76968,143.9288,-37.27467,145.96676'
    },
    'auckland': {
        'name': 'Auckland',
        'area': '-37.11972,174.36127,-36.69255,175.04723'
    }
}

$('#cities').live('pagebeforecreate',function(e){
    $.each(cities, function(name,city){
        console.warn(name,city)
        $('#cities div.[data-role="content"]').append('<p>' + name + '</p>');
    });
});

// $('#cities').live('pageinit',function(e){
//     var api_url = 'https://sna.pr/api';
//     $.ajax({
//         url: api_url + '/thumbs/',
//         dataType: 'jsonp',
//         data: {
//             area: cities['new-york']['area'],
//             n: 10,
//             sort: 'favorite_count'
//         },
//         success: function(response){
//             if(response.success){
//                 if( response.response.photos.length ){
//                     console.log(response.response.photos);
//                     // $('#title-block-template').tmpl(date).appendTo('#image-list');
//                     // $( "#city-thumbs-template" ).tmpl( response.response.photos ).appendTo('#image-list');
//                 }
//             }else{
//                 // if (response.error.message == 'group does not exist (following)') {
//                     // $('#feed-getting-started').show();
//                 // } else {
//                     // notification(response.error.message);
//                 // }
//             }
//             // week_index++;
//             // if (week_index < week_dates.length) {
//             //     date = week_dates[week_index];
//             //     load_weekly_top_ten(params.city, date['from'], date['to']);
//             // }else{
//             //     spinner_stop();
//             // }
//         }
//     });
//     
// });