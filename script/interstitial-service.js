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

const switchPayload = {
	user: "foo",
	digest: "bar",
	inserts: [
		{
			id: 1,
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

const resumePayload = {
	user: "foo",
	digest: "bar",
	resume: undefined,
};

class InterstitialService {
	insertId = 1;
	url = "https://api.red5pro.com";
	app = "live";
	streamName = "streamName";
	interstitialGuid = "live/streamName";
	currentGuid = null;

	constructor(endpoint, app, streamName) {
		this.app = app;
		this.streamName = streamName;
		this.interstitialGuid = `${app}/${streamName}`;
		this.url = `${endpoint}/${app}/interstitial`;
	}

	async switchToStream(streamGuid, isLive, loop = false, duration = null) {
		if (streamGuid === this.interstitialGuid) {
			return await this.resume();
		} else if (streamGuid === this.currentGuid) {
			return true;
		}

		const { inserts } = switchPayload;
		const insert = {
			...inserts[0],
			...{
				id: this.insertId++,
				target: this.interstitialGuid,
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
				// If we are switching to a new stream, we need to call resume to unload current stream.
				if (this.currentGuid && this.currentGuid !== this.interstitialGuid) {
					await this.resume();
				}
				this.currentGuid = streamGuid;
			}
			return success;
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	async resume() {
		try {
			this.currentGuid = null;
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
