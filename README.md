<h3 align="center">
  <img src="assets/Red5_Truetime_black.png" alt="Red5 TrueTime" style="height: 60px" />
</h3>

# Red5 TrueTime

The Red5 TrueTime is a web-based application for broadcasting content providers that provides an interface to preview multiple live streams delivered in a single stream from the [Red5 TrueTime Multiview for Production](https://github.com/red5pro/truetime-production) technology to deliver Interstitial streams to multiple end-users with sub-400ms latency.

Along with being able to select a single live stream to deliver from several concurrent live streams, the web-based application allows for pre-recorded Clip and Ad insertion during a live stream. Once either a Clip or Ad has finished, the stream will return to the previously selected live stream.

> For more information about the single stream of multiple live streams, please refer to the [Red5 TrueTime MultiView for Production](https://github.com/red5pro/truetime-production).

- [Project Structure](#project-structure)
- [Usage](#usage)
  - [Query Params](#query-params)
- [Examples](#example-usage-with-query-params)

# Project Structure

The following defines the role of the relevant files for the project.

> Please view the files individually for more comments and information.

## index.html

The [index.html](index.html) only and main HTML page of the TrueTime web application.

## style/main.css

the [main.css](style/main.css) file is the main style declarations for the TrueTime web application.

## Scripts

### script/main.js

The [main.js](script/main.js) file is the main entry for the application and is loaded as a `module`.

### script/mixer-service.js

The [mixer-service](script/mixer-service.js) is responsible for interfacing with the BrewMixer API. The BrewMixer API is exposed from the `brewmixer` webapp installed on the same server as the Interstitial plugin as is responsible for mixing mulitple streams into a grid and delivering a single stream to be consumed.

> For more information about the single stream of multiple live streams, please refer to the [Red5 TrueTime MultiView for Production](https://github.com/red5pro/truetime-production).

### script/interstitial-service.js

The [interstitial-service](script/interstitial-service.js) is responsible for interfacing with the Interstitial API to live switch streams delivered to every subscriber of the initial interstitial stream. Live streams and pre-recorded files (a.k.a., Clips and Ads) can be switched to and delivered live to all viewers.

### script/clips-service.js

The [clips-service](script/clips-service.js) is responsible for interfacing with the `clips.jsp` servlet. The `clips.jsp` servlet is a very basic service to return a listing of MP4 and FLV files available from the `streams` directory of the target scope on the server.

### script/ad-service.js

The [ad-service](script/ad-service.js) is responsible for selecting an Ad file to be streamed as an interstitial. It currently holds a canned list of files it assumes to be available from the server that is serving the interstitial stream.

### script/clips-controller.js

The [clips-controller](script/clips-controller.js) integrates with the `clips-service` to display a grid of available pre-recorded clips available to preview and insert into the interstitial stream to be delivered all subscribers.

### script/mixer-controller.js

The [mixer-controller](script/mixer-controller.js) intergrates with the BrewMixer API and provides User-based interaction between the playback of the mixed stream and selection, as well as drag-and-drop capabilities, to the gridded area in order to preview a single live clip from the single grid.

### script/preview-container.js

The [preview-container](script/preview-container.js) provides the UI behavoiur in previewing live and pre-recorded streams. It handles being able to playback both live and recorded content, as well as provide droppable areas for Users to change the preview. Additionally, it has controls for requesting to insert live or pre-recorded content (a.k.a., Clips and Ads) into the interstitial stream.

### script/source-container.js

The [source-container](script/source-container.js) provides the UI behavious in switching between the single gridded mixed stream and the grid listing of available Clips.

### script/coord-util.js

The [coord-util](script/coord-util.js) is a utility to convert points within the single grid of mixed content to access the proper stream under the mouse/click pointer.

### script/url-util.js

The [url-util](script/url-util.js) is a utility to access and provide query parameters from the URL that is used to configure the web application.

# Usage

When visiting the TrueTime webapp - either through launching in `dev` or loaded from a built distribution - there are several optional query params that can be added to the landing URL to configure the app to use your own Red5 Pro Server deployment and playback live streams.

Once loaded with the proper configurations you will be able to view a grid of mixed streams to select from, as well as a grid of pre-recorded Clips to select and insert into the interstitial.

> It is important to note that your Red5 Pro Server will need to be properly configured to allow for both Interstitial streaming and BrewMixer functionality for TrueTime Mutliview for Production.

## Query Params

The following query parameters are available. Though _optional_, it is recommended to use in order to properly configure your TrueTime MultiView session.

| Param Name |       Default Value        | Description                                                          |
| :--------- | :------------------------: | :------------------------------------------------------------------- |
| `host`     | `window.location.hostname` | The Red5 Pro Server endpoint that hosts the live streams. _The FQDN_ |
| `app`      |           `live`           | The webapp context on which the live streams reside.                 |
