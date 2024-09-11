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
 * Payload Schema to use for switching streams.
 */
const switchPayload = {
	user: "foo",
	digest: "bar",
	inserts: [
		{
			id: 0,
			target: undefined,
			interstitial: undefined,
			loop: false,
			type: "INDEFINITE",
			isInterstitialAudio: true,
			isInterstitialVideo: true,
			start: 0,
			// duration: 30000,
		},
	],
};

/**
 * Payload Schema to use for resuming a stream.
 */
const resumePayload = {
	user: "foo",
	digest: "bar",
	resume: undefined,
};

class InterstitialService {
	insertId = 0;
	url = "https://api.red5pro.com";
	app = "live";
	streamName = "streamName";
	interstitialGuid = "live/streamName";
	previousLivePayload = null;

	/**
	 * Constructor.
	 * @param {string} endpoint Service base endpoint including protocol and port.
	 * @param {string} app Webapp scope name (e.g., `live`).
	 * @param {string} streamName Name of the Interstitial stream to start insert streams.
	 */
	constructor(endpoint, app, streamName) {
		this.app = app;
		this.streamName = streamName;
		this.interstitialGuid = `${app}/${streamName}`;
		this.url = `${endpoint}/${app}/interstitial`;
	}

	/**
	 * Queues previous live stream to resume after the interstitial.
	 * @param {object} payload delta payload to queue.
	 * @returns Promise<boolean> Success of the operation.
	 */
	async queuePreviousLive(payload) {
		try {
			const { inserts } = payload;
			const insert = {
				...inserts[0],
				...{
					id: this.insertId++,
					immediate: false,
					// start: 0
				},
			};
			const response = await fetch(this.url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...payload, inserts: [insert] }),
			});
			const { status } = response;
			return status >= 200 && status < 300;
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	/**
	 * Request to switch interstitial stream.
	 * @param {string} streamGuid The stream GUID to switch to (e.g., `live/stream2`).
	 * @param {boolean} isLive If the stream is a live stream.
	 * @param {boolean} loop (optional) If the stream should loop.
	 * @param {number} duration (optional) Duration of the stream in milliseconds.
	 * @returns Promise<boolean> Success of the operation.
	 */
	async switchToStream(streamGuid, isLive, loop = false, duration = null) {
		// If switching to a non-live stream, queue up the current one to resume after the interstitial.
		const { inserts } = switchPayload;
		const insert = {
			...inserts[0],
			...{
				id: this.insertId++,
				target: this.interstitialGuid,
				immediate: true,
				interstitial: streamGuid,
				loop,
				start: new Date().getTime(),
				duration: duration ? Number(Math.floor(duration)) : 0,
				type: isLive || !duration ? "INDEFINITE" : "WALL_CLOCK",
			},
		};
		const payload = { ...switchPayload, inserts: [insert] };
		try {
			const response = await fetch(this.url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});
			const { status } = response;
			const success = status >= 200 && status < 300;
			if (success) {
				// If we are a Clip/Ad, we want to push the last live interstitial to the queue for resuming.
				if (!isLive && this.previousLivePayload) {
					await this.queuePreviousLive(this.previousLivePayload);
				}
				// If we are a live stream, we want to store the payload for resuming after the interstitial.
				if (isLive) {
					this.previousLivePayload = payload;
				}
			}
			return success;
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	/**
	 * Request to resume the previous live stream on intersitial.
	 * @returns Promise<boolean> Success of the operation.
	 */
	async resume() {
		try {
			// this.previousLivePayload = null;
			const response = await fetch(this.url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...resumePayload,
					resume: this.interstitialGuid,
				}),
			});
			const { status } = response;
			return status >= 200 && status < 300;
		} catch (error) {
			console.error(error);
			return false;
		}
	}
}

export default InterstitialService;
