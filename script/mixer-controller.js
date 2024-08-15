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
/* global red5prosdk */
import { getCoordinates } from "./coord-util.js";

const MIXER_VIDEO_ELEMENT_ID = "mixer-video";

class MixerController {
	mixerService = null;
	mixerConfiguration = null;
	layoutControls = null;
	videoManifest = null;
	delegate = null;

	constructor(mixerService, mixerConfiguration, layoutControls) {
		this.mixerService = mixerService;
		this.mixerConfiguration = mixerConfiguration;
		this.layoutControls = layoutControls;

		this.setUpDragDrop();

		layoutControls.forEach((control) => {
			control.addEventListener("click", async (event) => {
				const { target } = event;
				const { value } = target;
				try {
					this.videoManifest = await this.mixerService.updateGrid(value);
					this.recalculateCoordinates();
				} catch (error) {
					const columns = Math.sqrt(this.videoManifest.length);
					const control = this.layoutControls.find(
						(control) => control.value === "" + columns,
					);
					if (control) {
						control.checked = true;
					}
				}
			});
		});

		this.startMixerSubscription(mixerConfiguration);
	}

	async startMixerSubscription(mixerConfiguration) {
		const { isSecure, host, app, streamName } = mixerConfiguration;
		try {
			this.videoManifest = await this.mixerService.getEvent();
			const columns = Math.sqrt(this.videoManifest.length);
			const control = this.layoutControls.find(
				(control) => control.value === "" + columns,
			);
			if (control) {
				control.checked = true;
			}
			// console.log("[MIXER:manifest]:", this.videoManifest);

			const subscriberConfig = {
				protocol: isSecure ? "wss" : "ws",
				port: isSecure ? 443 : 5080,
				host,
				app,
				streamName,
			};
			await this.startMixerPlayback(subscriberConfig, MIXER_VIDEO_ELEMENT_ID);
		} catch (error) {
			console.error(error);
			alert("Failed to load mixer.");
		}
	}

	async startMixerPlayback(subscriberConfig, mediaElementId) {
		try {
			const { WHEPClient } = red5prosdk;

			// Video/Grid Calculations.
			const mixerVideo = document.getElementById(mediaElementId);
			mixerVideo.addEventListener("click", (event) => {
				this.handleMixerClick(event);
			});
			mixerVideo.addEventListener("resize", () => {
				this.recalculateCoordinates();
			});
			const ro = new ResizeObserver(() => {
				this.recalculateCoordinates();
			});
			ro.observe(mixerVideo);

			// Mixer Video Subscription.
			const subscriber = new WHEPClient();
			subscriber.on("*", (event) => {
				const { type } = event;
				if (type !== "Subscribe.Time.Update") {
					console.log(`[Mixer:Subscriber] :: ${event.type}`);
				}
			});
			await subscriber.init({ ...subscriberConfig, mediaElementId });
			await subscriber.subscribe();
			this.recalculateCoordinates();
		} catch (error) {
			console.error(error);
			throw new Error(`Failed to load WHEPClient: ${error.message}`);
		}
	}

	recalculateCoordinates() {
		const mixerVideo = document.getElementById(MIXER_VIDEO_ELEMENT_ID);
		const { clientWidth, clientHeight } = mixerVideo;
		const { videoWidth, videoHeight } = mixerVideo;
		const mixerFit = window
			.getComputedStyle(mixerVideo)
			.getPropertyValue("object-fit");
		const coordinates = getCoordinates(
			videoWidth,
			videoHeight,
			clientWidth,
			clientHeight,
			mixerFit,
		);
		return {
			...coordinates,
			widthPercentage: coordinates.width / videoWidth,
			heightPercentage: coordinates.height / videoHeight,
		};
	}

	getVideoUnderPoint(x, y) {
		const coordinates = this.recalculateCoordinates();
		console.log("[MIXER:coordinates]:", coordinates);
		console.log("[MIXER:click]:", x, y);
		const { widthPercentage, heightPercentage } = coordinates;
		const video = this.videoManifest.find((video) => {
			const { destX, destY, destWidth, destHeight } = video;
			const scaleX = destX * widthPercentage;
			const scaleY = destY * heightPercentage;
			const scaleWidth = (destX + destWidth) * widthPercentage;
			const scaleHeight = (destY + destHeight) * heightPercentage;
			const leftOfX = x >= scaleX;
			const rightOfXWidth = x <= scaleWidth;
			const belowY = y >= scaleY;
			const aboveYHeight = y <= scaleHeight;
			return leftOfX && rightOfXWidth && belowY && aboveYHeight;
		});
		return video;
	}

	handleMixerClick(event) {
		const { offsetX, offsetY } = event;
		const video = this.getVideoUnderPoint(offsetX, offsetY);
		if (video) {
			console.log("[MIXER:video]:", video);
			this.selectSource(video.streamGuid, true);
		}
	}

	setUpDragDrop() {
		const mixerVideo = document.getElementById(MIXER_VIDEO_ELEMENT_ID);
		mixerVideo.addEventListener("dragstart", (event) => {
			const { offsetX, offsetY } = event;
			const video = this.getVideoUnderPoint(offsetX, offsetY);
			if (video) {
				event.dataTransfer.setData(
					"text/plain",
					JSON.stringify({ ...video, type: "live" }),
				);
				event.dataTransfer.setDragImage(
					document.querySelector(".logo-holder_img"),
					0,
					50,
				);
			}
		});
	}

	selectSource(item, isLive) {
		if (this.delegate) {
			this.delegate.OnSourceSelection(item, isLive);
		}
	}
}

export default MixerController;
