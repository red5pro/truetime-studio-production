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
/* global red5prosdk, Hls */
const { WHEPClient } = red5prosdk;

/**
 * Preview Container is responsible for managing the preview of live and clip streams.
 *
 * Note: If looking for HLS playback support, it is recommended to use the Hls.js library in the index.html file.
 */
class PreviewContainer {
	subscriber = null;
	liveConfiguration = null;
	clipConfiguration = null;
	previewVideoLiveElement = null;
	previewVideoClipElement = null;
	dropElements = null;
	goLiveButton = null;
	playAdButton = null;
	previewState = null;
	clipDurationMS = null;
	hls = null;
	delegate = null; // OnGoLive, OnPlayAd

	/**
	 * Constructor.
	 * @param {object} liveConfiguration Init configuration for the live streams.
	 * @param {object} clipConfiguration Init configuration for the clip streams.
	 * @param {[HTMLEelment]} dropElements List of elements to enable drag and drop for previewing streams.
	 * @param {HTMLElement} previewVideoLiveElement Container element of the live stream preview.
	 * @param {HTMLElement} previewVideoClipElement Container element of the clip stream preview.
	 * @param {HTMLElement} goLiveButton Button to go live.
	 * @param {HTMLElement} playAdButton Button to play an ad.
	 */
	constructor(
		liveConfiguration,
		clipConfiguration,
		dropElements,
		previewVideoLiveElement,
		previewVideoClipElement,
		goLiveButton,
		playAdButton,
	) {
		this.liveConfiguration = liveConfiguration;
		this.clipConfiguration = clipConfiguration;
		this.previewVideoLiveElement = previewVideoLiveElement;
		this.previewVideoClipElement = previewVideoClipElement;
		this.dropElements = dropElements;
		this.goLiveButton = goLiveButton;
		this.playAdButton = playAdButton;

		// Simple handlers.
		this.goLiveButton.addEventListener("click", () => {
			this.goLive();
		});
		this.playAdButton.addEventListener("click", () => {
			this.playAd();
		});

		// Set up the clip duration for previews.
		this.previewVideoClipElement.onloadedmetadata = () => {
			const { duration } = this.previewVideoClipElement;
			// HTML Video duration is in seconds, convert to milliseconds
			this.clipDurationMS = Math.floor(duration * 1000);
		};

		// Set up drag and drop for previewing streams.
		this.dropElements.forEach((element) => {
			element.addEventListener("dragover", (event) => {
				event.preventDefault();
				event.dataTransfer.dropEffect = "move";
			});
			element.addEventListener("drop", (event) => {
				event.preventDefault();
				const data = event.dataTransfer.getData("text/plain");
				const json = JSON.parse(data);
				const { streamGuid, type } = json;
				const isLive = type === "live";
				const location = streamGuid.split("/");
				const streamName = location.pop();
				const app = location.join("/");
				this.preview(app, streamName, isLive);
			});
		});
	}

	/**
	 * Subscribe event handler.
	 * @param {*} event
	 */
	onSubscriberEvent(event) {
		const { type } = event;
		if (type !== "Subscribe.Time.Update") {
			console.log(`[Preview:Subscriber] :: ${event.type}`);
		}
	}

	/**
	 * Forward request to go live to delegate and unpreview.
	 */
	async goLive() {
		if (this.previewState) {
			try {
				if (this.delegate) {
					this.delegate.OnGoLive({
						...this.previewState,
						duration: this.clipDurationMS,
					});
				}
				await this.unpreview();
			} catch (e) {
				console.warn(e);
			}
		}
	}

	/**
	 * Forward request to play ad to delegate.
	 */
	async playAd() {
		if (this.delegate) {
			this.delegate.OnPlayAd();
		}
	}

	/**
	 * Add a preview of a stream to the container.
	 * @param {string} app The webapp scope.
	 * @param {string} streamOrFileName The stream name or file name.
	 * @param {boolean} isLive Flag of stream being live.
	 * @returns {boolean} Flag of completion.
	 */
	async preview(app, streamOrFileName, isLive) {
		this.goLiveButton.disabled = true;
		let complete = false;
		this.clipDurationMS = null;
		this.previewVideoLiveElement.classList.toggle("hidden", !isLive);
		this.previewVideoClipElement.classList.toggle("hidden", isLive);
		if (isLive) {
			this.goLiveButton.innerText = "Go Live";
			await this.unpreviewClip();
			complete = await this.updateLivePreview(app, streamOrFileName);
			this.goLiveButton.disabled = false;
		} else {
			this.goLiveButton.innerText = "Play Clip";
			await this.unpreviewLive();
			complete = await this.updateClipPreview(app, streamOrFileName);
			this.goLiveButton.disabled = false;
		}
		this.previewState = {
			app,
			streamName: streamOrFileName,
			isLive,
			duration: this.clipDurationMS,
		};
		return complete;
	}

	/**
	 * Remove the preview from the container.
	 */
	async unpreview() {
		if (this.previewState) {
			const { app, streamName, isLive } = this.previewState;
			if (isLive) {
				await this.unpreviewLive();
			} else {
				await this.unpreviewClip();
			}
			this.previewVideoLiveElement.classList.toggle("hidden", true);
			this.previewVideoClipElement.classList.toggle("hidden", true);
			this.previewState = null;
			this.goLiveButton.disabled = true;
		}
	}

	/**
	 * Unsubscribes from live stream playback.
	 * @returns {boolean} Flag of completion.
	 */
	async unpreviewLive() {
		if (this.subscriber) {
			try {
				await this.subscriber.unsubscribe();
			} catch (e) {
				console.warn(e);
			}
			this.subscriber = null;
		}
		// this.previewState = null;
		return true;
	}

	/**
	 * Unloads and stops clip stream playback.
	 */
	async unpreviewClip() {
		try {
			if (this.hls) {
				this.hls.stopLoad();
				this.hls.destroy();
				this.hls.remove();
				this.hls = null;
			}
			this.previewVideoClipElement.pause();
		} catch (e) {
			console.warn(e);
		}
		this.previewVideoClipElement.src = "";
	}

	/**
	 * Request to update the current live stream preview. Utitlizes the SwitchStreams API.
	 * @param {string} app The webapp scope.
	 * @param {string} streamName The name of the live stream.
	 * @returns {boolean} Flag of completion.
	 */
	async updateLivePreview(app, streamName) {
		if (this.subscriber) {
			try {
				this.subscriber.callServer("switchStreams", [
					{
						path: `${app}/${streamName}`,
						isImmediate: true,
					},
				]);
			} catch (e) {
				console.error(e);
				return false;
			}
		} else {
			try {
				const config = {
					...this.liveConfiguration,
					app,
					streamName,
					mediaElementId: this.previewVideoLiveElement.id,
				};
				this.subscriber = new WHEPClient();
				this.subscriber.on("*", (event) => {
					this.onSubscriberEvent(event);
				});
				await this.subscriber.init(config);
				await this.subscriber.subscribe();
			} catch (e) {
				console.error(e);
				this.unpreviewLive();
				return false;
			}
		}
		return true;
	}

	/**
	 * Updates the current clip stream preview with the provided stream filename.
	 * @param {string} app The webapp scope.
	 * @param {string} streamFilename The name of the clip stream.
	 */
	async updateClipPreview(app, streamFilename) {
		const isHLS = streamFilename.includes(".m3u8");
		const isFLV = streamFilename.includes(".flv");
		const { host, protocol, port } = this.clipConfiguration;
		const proto = protocol === "ws" ? "http" : "https";
		const location = app.includes("/streams") ? app : `${app}/streams`;
		const src = `${proto}://${host}:${port}/${location}/${streamFilename}`;
		if (isHLS && Hls) {
			const hls = new Hls({ debug: true, backBufferLength: 0 });
			hls.attachMedia(this.previewVideoClipElement);
			hls.on(Hls.Events.MEDIA_ATTACHED, () => {
				hls.loadSource(src);
			});
			this.hls = hls;
		} else {
			this.previewVideoClipElement.src = isFLV
				? src.replace(".flv", ".mp4")
				: src;
		}
	}
}

export default PreviewContainer;
