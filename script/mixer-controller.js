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
import { query } from "./url-util.js";
import { getCoordinates } from "./coord-util.js";
const { port, unsecurePort } = query();

const MIXER_VIDEO_ELEMENT_ID = "mixer-video";

/**
 * Mixer Controller is responsible for managing the Mixer service and the video grid.
 */
class MixerController {
	mixerService = null;
	mixerConfiguration = null;
	layoutControls = null;
	videoManifest = null;
	delegate = null;

	/**
	 * Constructor
	 * @param {MixerService} mixerService Mixer service instance.
	 * @param {object} mixerConfiguration Init configuration for the Mixer stream.
	 * @param {[HTMLElement]} layoutControls List of radio buttons for layout selection.
	 */
	constructor(mixerService, mixerConfiguration, layoutControls) {
		this.mixerService = mixerService;
		this.mixerConfiguration = mixerConfiguration;
		this.layoutControls = layoutControls;

		// Enable drag and drop.
		this.setUpDragDrop();
		// Enable layout selection which integrates with MixerService.
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
	}

	/**
	 * Request to start the Mixer service and playback.
	 */
	async start() {
		return this.startMixerSubscription(this.mixerConfiguration);
	}

	/**
	 * Request to stop the Mixer service and playback.
	 */
	async stop() {
		// TODO
	}

	/**
	 * Starts the Mixer service and playback.
	 * @param {object} mixerConfiguration Init configuration for the Mixer stream.
	 */
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
			// Red5 HTML SDK configuration.
			const subscriberConfig = {
				protocol: isSecure ? "wss" : "ws",
				port: isSecure ? port : unsecurePort,
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

	/**
	 * Starts the Mixer playback.
	 * @param {object} subscriberConfig Init configuration for the Mixer stream.
	 * @param {string} mediaElementId ID of the video element to playback the Mixer stream.
	 */
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

	/**
	 * Recalculates the coordinates of the video grid to determine drag-and-drop and click events.
	 * @returns Object
	 */
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

	/**
	 * Locates the target video under the point of the click event from the grid of videos.
	 * @param {int} x
	 * @param {int} y
	 * @returns Object
	 */
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

	/**
	 * Select the video under the point of the click event.
	 * @param {*} event
	 */
	handleMixerClick(event) {
		const { offsetX, offsetY } = event;
		const video = this.getVideoUnderPoint(offsetX, offsetY);
		if (video) {
			this.selectSource(video.streamGuid, true);
		}
	}

	/**
	 * Sets up the drag-and-drop functionality for the Mixer video.
	 */
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
					document.querySelector("#dragger_icon"),
					40,
					40,
				);
			}
		});
	}

	/**
	 * Notifies the delegate of the selected source.
	 * @param {object} item The video object from the mixer source manifest.
	 * @param {boolean} isLive
	 */
	selectSource(item, isLive) {
		if (this.delegate) {
			this.delegate.OnSourceSelection(item, isLive);
		}
	}
}

export default MixerController;
