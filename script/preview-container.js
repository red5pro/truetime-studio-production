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

		this.goLiveButton.addEventListener("click", () => {
			this.goLive();
		});
		this.playAdButton.addEventListener("click", () => {
			this.playAd();
		});

		this.previewVideoClipElement.onloadedmetadata = () => {
			const { duration } = this.previewVideoClipElement;
			// HTML Video duration is in seconds, convert to milliseconds
			this.clipDurationMS = (duration * 1000).toFixed(0);
			console.log("[CLIP:length]", this.previewVideoClipElement.duration);
		};

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

	onSubscriberEvent(event) {
		const { type } = event;
		if (type !== "Subscribe.Time.Update") {
			console.log(`[Preview:Subscriber] :: ${event.type}`);
		}
	}

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

	async playAd() {
		if (this.delegate) {
			this.delegate.OnPlayAd();
		}
	}

	async preview(app, streamOrFileName, isLive) {
		this.goLiveButton.disabled = true;
		let complete = false;
		this.clipDurationMS = null;
		this.previewVideoLiveElement.classList.toggle("hidden", !isLive);
		this.previewVideoClipElement.classList.toggle("hidden", isLive);
		if (isLive) {
			await this.unpreviewClip();
			complete = await this.updateLivePreview(app, streamOrFileName);
			this.goLiveButton.disabled = false;
			this.goLiveButton.innerText = "Go Live";
		} else {
			await this.unpreviewLive();
			complete = await this.updateClipPreview(app, streamOrFileName);
			this.goLiveButton.disabled = false;
			this.goLiveButton.innerText = "Play Clip";
		}
		this.previewState = {
			app,
			streamName: streamOrFileName,
			isLive,
			duration: this.clipDurationMS,
		};
		return complete;
	}

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

	async updateClipPreview(app, streamFilename) {
		const isHLS = streamFilename.includes(".m3u8");
		const isFLV = streamFilename.includes(".flv");
		const { host, protocol, port } = this.clipConfiguration;
		const proto = protocol === "ws" ? "http" : "https";
		const location = app.includes("/streams") ? app : `${app}/streams`;
		const src = `${proto}://${host}:${port}/${location}/${streamFilename}`;
		if (isHLS) {
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
