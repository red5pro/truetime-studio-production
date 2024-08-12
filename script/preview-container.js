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
const { WHEPClient } = red5prosdk;
class PreviewContainer {
	subscriber = null;
	baseConfiguration = null;
	previewVideoLiveElement = null;
	previewVideoClipElement = null;
	goLiveButton = null;
	playAdButton = null;
	previewState = null;

	delegate = null; // OnGoLive, OnPlayAd

	constructor(
		baseConfiguration,
		previewVideoLiveElement,
		previewVideoClipElement,
		goLiveButton,
		playAdButton,
	) {
		this.baseConfiguration = baseConfiguration;
		this.previewVideoLiveElement = previewVideoLiveElement;
		this.previewVideoClipElement = previewVideoClipElement;
		this.goLiveButton = goLiveButton;
		this.playAdButton = playAdButton;

		this.goLiveButton.addEventListener("click", () => {
			this.goLive();
		});
		this.playAdButton.addEventListener("click", () => {
			this.playAd();
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
					this.delegate.OnGoLive(this.previewState);
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

	async preview(app, streamName, isLive) {
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
					...this.baseConfiguration,
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
				return false;
			}
		}
		this.previewState = {
			app,
			streamName,
			isLive,
		};
		return true;
	}

	async unpreview() {
		if (this.subscriber) {
			try {
				await this.subscriber.unsubscribe();
			} catch (e) {
				console.warn(e);
			}
			this.subscriber = null;
		}
		this.previewState = null;
	}
}

export default PreviewContainer;
