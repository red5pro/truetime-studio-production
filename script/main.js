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
/*global red5prosdk*/
import { query } from "./url-util.js";
import AdServiceImpl from "./ad-service.js";
import ClipsServiceImpl from "./clips-service.js";
import MixerServiceImpl from "./mixer-service.js";
import InterstitialServiceImpl from "./interstitial-service.js";
import PreviewContainerImpl from "./preview-container.js";
import SourceContainerImpl from "./source-container.js";
import ClipsControllerImpl from "./clips-controller.js";
import MixerControllerImpl from "./mixer-controller.js";

const { setLogLevel, WHEPClient } = red5prosdk;
setLogLevel("debug");

const NAME = "[Red5:IBC]";
const CLIPS_POLL_INTERVAL = -1;
const ipv4Pattern =
	/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const hostIsIPv4 = (host) => ipv4Pattern.test(host);

const {
	host,
	app,
	streamName,
	mixerHost,
	mixerEventName,
	mixerStreamName,
	get,
} = query();

const isSecureHost = !hostIsIPv4(host);
const isMixerSecureHost = !hostIsIPv4(mixerHost);
const baseConfiguration = {
	host,
	app,
	protocol: !isSecureHost ? "ws" : "wss",
	port: !isSecureHost ? 5080 : 443,
};
const mixerConfiguration = {
	isSecure: isMixerSecureHost,
	host: mixerHost,
	app,
	protocol: !isMixerSecureHost ? "ws" : "wss",
	port: !isMixerSecureHost ? 5080 : 443,
	eventName: mixerEventName,
	streamName: mixerStreamName,
};

const serviceEndpoint = `http${isSecureHost ? "s" : ""}://${baseConfiguration.host}:${baseConfiguration.port}`;
const mixerEndpoint = `http${isMixerSecureHost ? "s" : ""}://${mixerConfiguration.host}:${mixerConfiguration.port}/brewmixer/1.0/${mixerConfiguration.eventName}`;

const service = new InterstitialServiceImpl(serviceEndpoint, app, streamName);
const clipsService = new ClipsServiceImpl(serviceEndpoint);
const mixerService = new MixerServiceImpl(mixerEndpoint);
const adService = new AdServiceImpl(app);

// Utility
const getAppAndStream = (streamFileOrName) => {
	let webapp = app;
	let stream = streamFileOrName;
	let streamIsGuid = streamFileOrName.includes("/");
	if (streamIsGuid) {
		const location = streamFileOrName.split("/");
		stream = location.pop();
		webapp = location.join("/");
	}
	return { app: webapp, streamName: stream };
};

// Source / Clips Toggle UI
const sourceContainer = new SourceContainerImpl(
	Array.from(document.querySelectorAll(".source-selector_item")),
	Array.from(document.querySelectorAll(".source-container_source")),
);

// Simple Resume Button.
const stopButton = document.querySelector("#ad-info-container_button");
stopButton.addEventListener("click", () => {
	service.resume();
});

// Preview Container for Source / Clips
const droppables = Array.from(document.querySelectorAll(".video-droppable"));
const previewContainer = new PreviewContainerImpl(
	mixerConfiguration,
	baseConfiguration,
	droppables,
	document.querySelector("#preview-video_live_element"),
	document.querySelector("#preview-video_clip_element"),
	document.querySelector("#preview-button_live"),
	document.querySelector("#preview-button_ad"),
);
previewContainer.delegate = {
	OnGoLive: async ({ app, streamName, isLive, duration }) => {
		const streamGuid = `${app}/${isLive ? streamName : `${streamName.replace(".mp4", ".flv")}`}`;
		await service.switchToStream(
			streamGuid,
			isLive,
			false,
			isLive ? null : duration,
		);
	},
	OnPlayAd: async () => {
		try {
			await service.resume();
		} catch (error) {
			console.error(error);
		}
		const ad = adService.getNext();
		const { streamGuid } = ad;
		service.switchToStream(`${streamGuid.replace(".mp4", ".flv")}`, false);
	},
};

// Mixer Controller
const layoutControls = Array.from(
	document.querySelectorAll('input[name="layout"]'),
);
const mixerController = new MixerControllerImpl(
	mixerService,
	mixerConfiguration,
	layoutControls,
);
mixerController.delegate = {
	OnSourceSelection: (streamFileOrName) => {
		const { app, streamName } = getAppAndStream(streamFileOrName);
		previewContainer.preview(app, streamName, true);
	},
};

// Clips Controller
const clipsController = new ClipsControllerImpl(
	clipsService,
	document.querySelector("#clips-video-container"),
);
clipsController.delegate = {
	OnSelection: (streamFileOrName) => {
		const { app, streamName } = getAppAndStream(streamFileOrName);
		previewContainer.preview(app, streamName, false);
	},
};

// Live Stream Playback
const startLiveStream = async () => {
	try {
		const { WHEPClient } = red5prosdk;
		const configuration = {
			...baseConfiguration,
			streamName,
			mediaElementId: "live-video_video_element",
		};
		const subscriber = new WHEPClient();
		subscriber.on("*", (event) => {
			const { type } = event;
			if (type !== "Subscribe.Time.Update") {
				console.log(`[Live:Subscriber] :: ${event.type}`);
			}
		});
		await subscriber.init(configuration);
		await subscriber.subscribe();
	} catch (error) {
		console.error(error);
		alert(`Failed to start live stream: ${error.message || error}`);
	}
};

// Start the live stream.
const main = async () => {
	await startLiveStream();
	await mixerController.start();
	await clipsController.start(CLIPS_POLL_INTERVAL);
};
main();
