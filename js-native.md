# Javascript - Native Code interface

## JS → Native

To pass data to the native code JS will create an iframe and request `snapr://` url with it. Watch for any requests for `snapr://` urls and take appropriate action. You can't respond to these requests because JS can't read from the iframe and it is quickly destroyed.

Urls will be in the format `snapr://base?param=value&param2=value` or `snapr://base/?param=value&param2=value`, note the `/` before the `?` may or may not be present.




## Login

### JS → Native

Called on login so native code can use credentials for upload and store to reload the html without requiring the user to login again.

* **Base**: login
* **Params**
    * **snapr_user**: Username for unique identification and api calls
    * **display_username**: Username for display, may contain spaces
    * **access_token**: The user's Oauth Access Token

Example:

    snapr://login?snapr_user=myusername&display_username=User%20Name&access_token=s3cRetHaShc0De

### Native → JS

Load into any view with the following parameters to display it and auto login:

* **snapr_user**: Username for unique identification and api calls
* **display_username**: Username for display
* **access_token**: The user's Oauth Access Token

Example:

    #/dash/?snapr_user=myusername&display_username=User%20Name&access_token=s3cRetHaShc0De




## Logout

Called on logout so native code can forget any stored credentials.

* **Base**: logout
* **Params**: None

Example:

    snapr://logout




## Geolocation

### JS → Native

Called to request geolocation from native code. The JS stores locations for a set amount of time so this call is not used too often.

* **Base**: get_location
* **Params**: None

Example:

    snapr://get_location

### Native → JS

When the location has been determined call the javascript function `set_location` with parameters `latitude` and `longitude` in `+/-DDD.DDDDDD` format.

Example:

    set_location(-37.32567, 175.8765)


If there is a problem determining the location call the javascript function `location_error` with an error message string.

Example:

    location_error("User denied Geolocation")


## Linking services

1. Linking URL is requested and requested in webview:

        http://sna.pr/api/linked_services/<service>/oauth/?redirect=snapr%3A%2F%2Fredirect%3Fredirect_url%3Dfile%253A%2F%2F%2Fpath%2Findex.html%2523%2Fmy-account%2F%253F&display=touch&access_token=<token>

2. Snapr API redirects webview to the 3rd party, authentication is performed

3. 3rd party redirects webview back to snapr API:

        http://sna.pr/api/linked_services/<service>/oauth/?code=<authorised code>

4. Snapr API links the account, gets details and redirects webview to a snapr://redirect URL, with some extra params:

        snapr://redirect?redirect_url=file%3A///path/index.html%23/my-account/%3F&username=<Full Name>

5. Native code redirects JS app to the given URL, **passing on any extra params**:

        file:///path/index.html#/my-account/?username=<Full Name>

Passing on the extra parameters is important. It is nessacary because the API is designed to redirect to a URL after linking and provide some details for the resource at that URL to use. The API does not know, nor should it, whether the resource will make use of those details itself or pass them on in a redirect so they are provided unencoded. This is more clear in a case where we don't pass the second redirect URL around:

    http://sna.pr/api/linked_services/<service>/oauth/?redirect=http%3A%2Fexample.com%2F

In this case, after linking you will be redirected to `http://example.com/?username=FullName`. example.com will handle the username param. In the case of a mobile application the base redirect URL also contains a second, encoded, redirect URL to be used by the native code but the API doesn't care, it's not the API's job to figure out what's going to happen to the URL later.





## Uploads

### Start

Called to initiate an upload. You should pass any params on to the upload API, and also include them in the upload_progress() JSON.

* **Base**: upload
* **Params**
    * **local_id**: A unique id that is used to identify this upload in the queue
    * **snapr_user**: Username for unique identification and api calls
    * **display_username**: Username for display, may contain spaces
    * **photo**: the photo_path that the share page was loaded with
    * **any other params the share page was loaded with***: You may choose to load #/share with extra params, these will be returned here

    * **snapr api params**: The following params can be passed to the snapr api with the upload, any extra params not documented here should also be sent with the upload.
        * latitude
        * longitude
        * access_token
        * share_location
        * comp_id
        * status
        * foursquare_checkin
        * tumblr
        * facebook_album
        * tweet
        * device_time
        * description

Example:

    snapr://upload?device_time=2012-11-06 14:28:35&description=testing&status=public&tumblr=true&share_location=true&longitude=-122.406500&latitude=37.785833&photo=file%3A%2F%2F%2Fthis%2Fthat%2Fpreview-image.jpg&access_token=s3cRetHaShc0De&snapr_user=myusername&display_username=User%20Name&local_id=102142835


### Cancel

Called to cancel an upload (active or queued).

* **Base**: upload
* **Params**:
    * **cancel**: The local_id of the upload

Example:

    snapr://upload?cancel=102142835


### Resume

Called to resume uploading after the queue is paused.

* **Base**: upload
* **Params**: start

Example:

    snapr://upload?start




## Upload progress

As a photo is uploaded call the `upload_progress` javascript function to update the progress display.

Call the function with either a Javascript object or JSON text in the following format.

Any time there is a change to the queue status you should call upload_progress() at least once - for example if a new upload is added, but there is no connection, call upload_progress() so we can update the queue to show the stalled item. You should also be sure upload_progress() is called at least once on any completion event that changes the status of the queue - including an image being removed from the queue due to completion.

    {
        "uploads": [
            {
                "upload_status": "active",
                "percent_complete": 27,
                "local_id": "92135044",
                "thumbnail": "file:///this/that/92135044.jpg",

                any other parameters that were passed with the snapr://upload call

            }
        ]
    }

Valid statuses:

* waiting
* active
* completed
* canceled





## Upload complete

When an upload competes call the javascript function `upload_completed` with it's `local_id` and the `snapr_id` returned from the server.

Example:

    upload_completed('92135044', 'LOG');





## Upload failed

When an upload fails call the javascript function `upload_failed` with it's `local_id` and an error message.

Example:

    upload_failed('92135044', 'Duplicate upload');




## Upload canceled

When an upload is canceled call the javascript function `upload_canceled` with it's `local_id`.

Example:

    upload_canceled('92135044');





## Alerts

Native replacements for javascript `alert()` and `confirm()`

### Simple Alert

A simple alert with only one button, like the JS native `alert()`

* **Base**: alert
* **Params**
    * **title**: Alert title
    * **otherButton1**: "OK"
    * **alertID**: 0 - simple alerts are not responded to
    * **message**: Body of the alert, may be empty allowing title-only

Example:

    snapr://alert?title=Warning&otherButton1=OK&alertID=0&message=Something%20is%20not%20right


### Full Alert functionality (there are currently none of these)

#### JS → Native

All buttons are optional but either `cancelButton` or `otherButton1` must be supplied

* **Base**: alert
* **Params**
    * **title**: Alert title
    * **cancelButton**: Button label (buttonIndex 0)
    * **otherButton1**: Button label (buttonIndex 1)
    * **otherButton2**: Button label (buttonIndex 2)
    * **otherButton3**: Button label (buttonIndex 3)
    * **alertID**: Unique int
    * **message**: Body of the alert, may be empty allowing title-only

Example:

    snapr://alert?title=Are%20you%20sure&otherButton1=Yes&cancelButton=No&alertID=34

#### Native → JS

When the user taps a button call the javascript function `tapped_alert` with parameters `alertID` and `buttonIndex`

Example:

    tapped_alert(34, 1);


### Actionsheets

#### JS → Native

All buttons are optional but either `cancelButton`, `destructiveButton` or `otherButton1` must be supplied

* **Base**: action
* **Params**
    * **title**: Title
    * **destructiveButton**: Button label (buttonIndex -1)
    * **cancelButton**: Button label (buttonIndex 0)
    * **otherButton1**: Button label (buttonIndex 1)
    * **otherButton2**: Button label (buttonIndex 2)
    * **otherButton3**: Button label (buttonIndex 3)
    * **actionID**: Unique int

Example:

    snapr://action?title=Are%20you%20sure&destructiveButton=Yes&cancelButton=No&actionID=36

#### Native → JS

When the user taps a button call the javascript function `tapped_action` with parameters `actionID` and `buttonIndex`

Example:

    tapped_action(36, -1);




## Editing

### camera+ settings

When the user saves settings related to camera+ this callback url will notify native code.

* **Base**: camplus/settings
* **Params**
    * **camplus_camera**: bool
    * **camplus_edit**: bool
    * **camplus_lightbox**: bool

Example:

    snapr://camplus/settings?camplus_camera=true&camplus_edit=true&camplus_lightbox=true

### camera+ edit

When the user taps the edit with camera+ button

* **Base**: camplus/edit
* **Params**
    * **photo_url**: photo_url
    * **description**: pass back after editing so description is retained
    * **foursquare_venue_name**: pass back after editing so venue is retained
    * **foursquare_venue_id**: pass back after editing so venue is retained
    * **location**: pass back after editing so location name is retained

Example:

    snapr://camplus/edit?photo_url=file%3A%2F%2F%2Fthis%2Fthat%2Fpreview-image.jpg&description=testing&location=New%20York

### Aviary edit

When the user taps the edit with aviary button

* **Base**: aviary/edit
* **Params**
    * **photo_url**: photo_url
    * **description**: pass back after editing so description is retained
    * **foursquare_venue_name**: pass back after editing so venue is retained
    * **foursquare_venue_id**: pass back after editing so venue is retained
    * **location**: pass back after editing so location name is retained

Example:

    snapr://aviary/edit?photo_url=file%3A%2F%2F%2Fthis%2Fthat%2Fpreview-image.jpg&description=testing&location=New%20York




## Shooting

Called to launch native camera, photo library or similar. All have the same params.

* **Base**
    * camera
    * photo-library
    * camplus/camera
    * camplus/lightbox
* **Params**
    * Any params passed should be used to load the #/share/ view once the photo is ready.

Example:

    snapr://camera?comp_id=5




## Back

Native → JS

For the Android back button.

Use this to go back instead of history - it handles closing dialogs, and sticky situations where back would mistakenly lead you to a web based OAuth flow.

Example:

    back();




## TODO

When first loading up the webview add appmode=true to the existing query string.

For more platform specific behaviour you can send a string, i.e. appmode=iphone or appmode=android

Send environment=X in order to run the app against different snapr servers. All apps should accept environment=dev and environment=live, if no param is sent the app will currently default to dev mode.

If there is no saved access token the app can show a new user welcome screen.

When loading up the site add new_user=true to the existing query string.

Linking Services

index.html#/connect/?photo_id=V36&to_link=twitter,foursquare,facebook,tumblr&redirect_url=index.html
