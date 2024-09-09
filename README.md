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

## script/main.js

The [main.js](script/main.js) file is the main entry for the application and is loaded as a `module`.
