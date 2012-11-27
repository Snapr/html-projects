/*global _  define require */
define([], function(){
    // 1337
    var translation = {
        // home
        'Menu': 'M3nu',
        'Camera Roll': 'C4m3ra R01l',
        'Dashboard': 'D45hb0ard',
        'My Snaps': 'My 5n4p5',
        'Popular': 'P0pu14r',
        'Map': 'M4p',
        'Cities': 'Ci7i35',
        'Spots': '5p075',
        'Activity': '4c7ivity',
        'Leaderboard': '134derb0ard',
        'Tumblr': '7umb1r',
        'Join': 'J0in',
        'Log In': '10g In',
        'Latest': '14735t',
        'Welcome': 'W31c0me',
        'About': '4b0u7',
        'Shoot': '5h0o7',
        'Nearby Images': 'N34rby Image5',
        'Popular Images': 'Popular Image5',
        'No images yet': 'No Image5',
        'Discover': 'Di5c0v3r',
        'Me': 'M3',
        'Login': '10gin',


        //login
        'You must enter your usename and password':"You must enter your usename and passwor",
        "Oops.. Your login or password was incorrect.":"ops.. Your login or password was incorr",
        "Sorry, we had trouble logging in. Please try again.":"orry, we had trouble logging in. Please try again",
        'Log in': '10g in',
        'Username': 'U53rn4me',
        'Password': 'P45sw0rd',
        'Login with': '10gin wi7h',
        'Forgot Password?': 'F0rgo7 P45sword?',


        //app
        'Get the App!': 'G37 the 4pp!',
        'For the best experience please download one of our apps': 'F0r 7h3 be5t experience p1e4se download one of our apps',
        'Does your phone allow browser based uploads?': 'D035 your phone 41low browser based uploads?',
        'Upload via Mobile Web': 'Up104d via Mobil3 Web',


        //spots
        'Venue Name': 'V3nue N4me',
        'Nearest': 'N34re57',
        'All': '41l',
        'Food': 'F0od',
        'Nightlife': 'Nigh71if3',
        'Arts': '4r75',
        'Outdoors': '0u7d0or5',
        'Shopping': '5h0pping',
        'results': 'r35u17s',
        'show on map': '5h0w on m4p',
        'no photos yet': 'n0 pho7o5 y3t',
        'photo by': 'ph07o by',


        //search
        "Keywords": "K3yw0rd5",
        "Tags": "74g5",
        "Locations": "10c47ion5",
        "Users": "U53rs",
        "Place Name": "P14c3 Name",
        "People": "P30p1e",
        "photos": "ph07o5",
        "followers": "f01low3r5",


        //popular
        'Today': '70d4y',
        'Week': 'W3ek',

        //feed
        'More': 'M0r3',
        'List': '1i57',
        'Grid': 'Grid',
        'Load More': '104d Mor3',
        'Feed': 'F3ed',
        "That's Me": "Th47'5 M3",
        'Photos': 'Ph07o5',
        'Followers': 'F01low3r5',
        'Following': 'F01lowing',
        'Show': '5h0w',
        'Comment': 'C0mm3n7',
        'likes this': '1ik35 7his',
        'Loading': '104ding',
        'Back': 'B4ck',
        'hide': 'hid3',
        'show': '5h0w',
        'Are you sure you want to delete this photo?': '4r3 y0u 5ure you w4n7 to de1ete this photo?',
        'Delete': 'D31e7e',
        'Cancel': 'C4nc31',
        'Follow': 'F01low',
        'Flag this image as innapropriate?': 'F14g 7hi5 imag3 as innapr0priate?',
        'Flag': 'F14g',


        //dahs
        'Dash': 'D45h',
        'Add your favorite people, or a search for something you want to keep track of.': '4dd y0ur f4vori73 peop1e, or a 5earch for something you want to keep track of.',
        'Add a Person': '4dd 4 P3r50n',
        'Add a Search': '4dd 4 53arch',
        'Keyword': 'K3yw0rd',
        'Anywhere': '4nywh3re',
        'Nearby': 'N34rby',
        'Search': '534rch',


        // Share
        'Skol Share': '5h4r3',
        'Add text...': '4dd t3Xt',
        'Show Options': '5h0w 0pti0n5',
        'Show Photo': '5h0w Ph0t0',
        'Share to': '5h4r3 t0',
        'Share': '5h4r3',
        'Getting location': 'G3tting l0c4ti0n',
        'Getting Venue': 'G3tting v3nu3',
        "Please set the image to Public before sharing to other services": "plz set the image to Public before sharing to other services",
        "Please enable location services for this app to use these features": "plz enable location services for this app to use these features",
        "No venues nearby": "N0 v3nu35 n34rby",
        'Location Disabled': "l0c4ti0n Di54bl3d",

        // my account
        'Update my profile details to match Twitter': 'Upd473 my pr0fi1e detail5 to match 7witter',
        'Import Profile': 'Imp0r7 Profi13',
        'Off': '0ff',
        'On': '0n',
        'Show Twitter in my Profile': '5h0w 7wi7t3r in my Profi1e',
        'Show Fsq in my Profile': '5h0w F5q in my Profi13',
        'Show Facebook in my Profile': '5h0w F4c3book in my Profi1e',
        'Show Tumblr in my Profile': '5h0w 7umb1r in my Profil3',
        'Set up': '537 up',
        'Link': '1ink',
        'Unlink': 'Un1ink',
        'Home': 'H0m3',
        'My Account': 'My 4cc0un7',
        'Logout': '10gou7',
        'Quick Links': 'Quick 1ink5',
        'Find Friends': 'Find Fri3nd5',
        'Settings': '537ting5',
        'Info': 'Inf0',
        'About Us': '4b0u7 U5',
        'About Snapr': '4b0u7 5n4pr',
        'Profile': 'Pr0fi13',
        'Your Name': 'Y0ur N4m3',
        'Location': '10c47ion',
        'Website': 'W3b5i7e',
        'Bio': 'Bi0',
        'Notifications': 'N07ific4tion5',
        'Follows': 'F01low5',
        'Likes': '1ik35',
        'Comments': 'C0mm3n75',
        'Comments on Comments': 'C0mm3n75 on Comments',
        'News Updates': 'N3w5 Upd47es',
        'Account': '4cc0un7',
        'Email': '3m4i1',
        'New Password': 'N3w P45sw0rd',
        'Verify': 'V3rify',
        'Save': '54v3',
        'Connect': 'C0nn3c7',
        'Linked Services': '1ink3d 5ervice5',
        "Connection Error!": "C0nn3c7ion 3rror!",
        "click to retry": "c1ick 70 r3try",
        "Add text": "4dd 73xt",
        "Share location": "5h4r3 10ca7ion",
        "Hi!": "Hi!",
        "Do you already have an account? Or would you like to join up?": "D0 you 41r3ady have an accoun7? 0r would you like to join up?",
        "Join Snapr": "J0in 5n4pr",
        "Find Out More": "Find 0u7 M0r3",
        "Facebook Friends": "F4c3b0ok Friend5",
        "Search Friends": "534rch Friend5",
        "Please connect your account": "P1345e c0nnec7 your account",
        "Twitter Friends": "7wi7t3r Friend5",
        "username": "u53rn4me",
        "Forgot Password": "F0rgo7 P45sword",
        "Username or Email": "U53rn4me 0r 3mai1",
        "Reset Password": "R35e7 P4ssw0rd",
        "Great, your Twitter account is linked!": "Gr347, y0ur 7witter account i5 1inked!",
        "To finish up please enter some more details for your new account on Snapr": "70 fini5h up p134se en7er some more details for your new account on 5napr",
        "Email Address": "3m4i1 4ddr35s",
        "All users must agree to the": "41l u53rs mus7 4gree t0 the",
        "Terms of Use": "73rm5 0f Use",
        "Success!": "5ucc35s!",
        "Welcome to Snapr!": "W31c0me 7o 5n4pr!",
        "What would you like to do now?": "Wh47 w0u1d you lik3 to do now?",
        "Find your friends": "Find y0ur fri3nd5",
        "Find out more about Snapr": "Find 0u7 mor3 4bout 5napr",
        "Dive right in!": "Div3 righ7 in!",
        "Refresh": "R3fre5h",
        "Release": "R31e45e",
        "No Photos": "N0 Pho7o5",
        "The End": "7h3 3nd",
        "Queue Paused": "Qu3ue P4u5ed",
        "Resume?": "R35ume?",
        "blog": "bl0g",
        "News": "N3w5",
        "View on": "Vi3w 0n",
        "Upload": "Up104d",
        "Select a photo to upload": "531ec7 4 ph0to to upload",
        "Images should be in .jpg format": "Im4g35 sh0u1d be in .jpg forma7",
        "Upload Snap": "Up104d 5nap",
        "Snaps": "5n4p5",
        "Each photo you take earns points. Get bonus points for sharing to social networks and if people comment on and like your images.": "34ch ph07o you tak3 earn5 points. Get bonus points for sharing to socia1 networks and if people comment on and like your images.",
        "points": "p0in75",
        "Show as Feed": "5h0w 45 F3ed",
        "Did you mean": "Did y0u m34n",
        "No results found in this area": "N0 r35u17s found in this 4rea",
        "Now": "N0w",
        "Just One": "Ju57 0n3",
        "Just Me": "Ju57 M3",
        "keywords": "k3yw0rd5",
        "likes": "1ik35",
        "like this": "1ik3 7hi5",
        "like": "1ik3",
        "comment": "c0mm3n7",
        "comments": "c0mm3n7z"
    };
    var leet = function(text){
        return text
            .replace('a', '4').replace('A', '4')
            .replace('e', '3').replace('E', '3')
            .replace('s', '5').replace('S', '5')
            .replace('t', '7').replace('T', '7')
            .replace('o', '0').replace('O', '0')
            .replace('l', '1').replace('L', '1');
    };
    window.TT = {};
    return function(text){
        if (text in translation){
            return translation[text];
        }else{
            if(!(text in window.TT)){
                window.TT[text] = leet(text);
            }

            console.warn(text, "not translated");
            return text.toUpperCase() + '!';
        }
     };
});
