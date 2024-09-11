/*
Copyright © 2015 Infrared5, Inc. All rights reserved.

The accompanying code comprising examples for use solely in conjunction with Red5 Pro (the "Example Code")
is  licensed  to  you  by  Infrared5  Inc.  in  consideration  of  your  agreement  to  the  following
license terms  and  conditions.  Access,  use,  modification,  or  redistribution  of  the  accompanying
code  constitutes your acceptance of the following license terms and conditions.

Permission is hereby granted, free of charge, to you to use the Example Code and associated documentation
files (collectively, the "Software") without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The Software shall be used solely in conjunction with Red5 Pro. Red5 Pro is licensed under a separate end
user  license  agreement  (the  "EULA"),  which  must  be  executed  with  Infrared5,  Inc.
An  example  of  the EULA can be found on our website at: https://account.red5.net/assets/LICENSE.txt.

The above copyright notice and this license shall be included in all copies or portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,  INCLUDING  BUT
NOT  LIMITED  TO  THE  WARRANTIES  OF  MERCHANTABILITY, FITNESS  FOR  A  PARTICULAR  PURPOSE  AND
NONINFRINGEMENT.   IN  NO  EVENT  SHALL INFRARED5, INC. BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN  AN  ACTION  OF  CONTRACT,  TORT  OR  OTHERWISE,  ARISING  FROM,  OUT  OF  OR  IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/**
 * List of canned streams available in `live/streams` directory.
 */
const AD_STREAMS = Object.freeze([
	{
		name: "Honda_CBR600rr_1280x720_h264",
		filename: "Honda_CBR600rr_1280x720_h264.mp4",
		duration: 74000,
		streamGuid: "Honda_CBR600rr_1280x720_h264.flv",
		url: "<endpoint>/<app>/streams/Honda_CBR600rr_1280x720_h264.mp4",
	},
	{
		name: "LIV_Golf_1280x720_h264",
		filename: "LIV_Golf_1280x720_h264.mp4",
		duration: 43000,
		streamGuid: "LIV_Golf_1280x720_h264.flv",
		url: "<endpoint>/<app>/streams/LIV_Golf_1280x720_h264.mp4",
	},
	{
		name: "Toyota_Tacoma_1280x720_h264",
		filename: "Toyota_Tacoma_1280x720_h264.mp4",
		duration: 90000,
		streamGuid: "Toyota_Tacoma_1280x720_h264.flv",
		url: "<endpoint>/<app>/streams/Toyota_Tacoma_1280x720_h264.mp4",
	},
	{
		name: "WaveRunner_Ad_1280x720_h264",
		filename: "WaveRunner_Ad_1280x720_h264.mp4",
		duration: 75000,
		streamGuid: "WaveRunner_Ad_1280x720_h264.flv",
		url: "<endpoint>/<app>/streams/WaveRunner_Ad_1280x720_h264.mp4",
	},
	{
		name: "TorkHub_Ad",
		filename: "TorkHub_Ad.mp4",
		duration: 49000,
		streamGuid: "TorkHub_Ad.flv",
		url: "<endpoint>/<app>/streams/TorkHub_Ad.mp4",
	},
]);

/**
 * The AdService is responsible for managing the list of available ads and cycling through upon request.
 */
class AdService {
	index = 0;
	endpoint = null;
	app = null;

	/**
	 * Constructor.
	 * @param {string} endpoint Endpoint for streams including protocol and port.
	 * @param {string} app Webapp scope name (e.g., `live`).
	 */
	constructor(endpoint, app) {
		this.endpoint = endpoint;
		this.app = app;
	}

	/**
	 * Constructs the full URL for the ad.
	 * @param {string} url
	 * @returns string
	 */
	getUrl(url) {
		return url.replace("<endpoint>", this.endpoint).replace("<app>", this.app);
	}

	/**
	 * Requests the next ad in list, cycles back if reached the end of list.
	 * @returns {object} The next ad in the list.
	 */
	getNext() {
		this.index = (this.index + 1) % AD_STREAMS.length;
		const ad = AD_STREAMS[this.index];
		return {
			...ad,
			url: this.getUrl(ad.url),
		};
	}
}

export { AD_STREAMS as AdStreams };
export default AdService;
