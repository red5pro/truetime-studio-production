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
// [NOTE]:: To get a different grid (3x3) call event url with PUT method and pass full json data.
// Default GET from event url will return 2x2 grid.
const CANNED_EVENT_DATA = [
	{
		rootVideoNode: {
			nodes: [
				{
					red: 0,
					green: 0,
					blue: 0,
					alpha: 1,
					node: "SolidColorNode",
				},
				{
					streamGuid: "live/stream1",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 0,
					destY: 0,
					destWidth: 960,
					destHeight: 540,
					node: "VideoSourceNode",
				},
				{
					streamGuid: "live/stream2",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 960,
					destY: 0,
					destWidth: 960,
					destHeight: 540,
					node: "VideoSourceNode",
				},
				{
					streamGuid: "live/stream3",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 0,
					destY: 540,
					destWidth: 960,
					destHeight: 540,
					node: "VideoSourceNode",
				},
				{
					streamGuid: "live/stream4",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 960,
					destY: 540,
					destWidth: 960,
					destHeight: 540,
					node: "VideoSourceNode",
				},
			],
			node: "CompositorNode",
		},
		rootAudioNode: {
			nodes: [
				{
					streamGuid: "live/stream1",
					pan: 0,
					gain: -6,
					node: "AudioSourceNode",
				},
				{
					streamGuid: "live/stream2",
					pan: 0,
					gain: -100,
					node: "AudioSourceNode",
				},
				{
					streamGuid: "live/stream3",
					pan: 0,
					gain: -100,
					node: "AudioSourceNode",
				},
				{
					streamGuid: "live/stream4",
					pan: 0,
					gain: -100,
					node: "AudioSourceNode",
				},
			],
			node: "SumNode",
		},
	},
];

const SourceSection = Object.freeze({
	SOURCES: "sources",
	CLIPS: "clips",
});

class SourceContainer {
	sourceButtons = [];
	sourceContainers = [];
	mixerConfiguration = null;
	delegate = null;

	constructor(sourceButtons, sourceContainers, mixerConfiguration) {
		this.sourceButtons = sourceButtons;
		this.sourceContainers = sourceContainers;
		this.mixerConfiguration = mixerConfiguration;

		this.sourceButtons.forEach((button) => {
			button.addEventListener("click", (event) => {
				const { target } = event;
				const { dataset } = target;
				this.selectSourceSection(dataset.selection);
			});
		});

		// TODO: Testing
		this.addTestFunc();

		this.startMixerSubscription(mixerConfiguration);
	}

	addTestFunc() {
		Array.from(document.querySelectorAll(".test-live_button")).forEach(
			(button) => {
				button.addEventListener("click", (event) => {
					const { dataset } = event.target;
					this.selectSource(dataset.name, true);
				});
			},
		);
		Array.from(document.querySelectorAll(".test-clip_button")).forEach(
			(button) => {
				button.addEventListener("dragstart", (event) => {
					event.dataTransfer.setData("text/plain", "clip");
				});
				button.addEventListener("click", (event) => {
					const { dataset } = event.target;
					this.selectSource(dataset.name, false);
				});
			},
		);
	}

	async getEvent(eventURL) {
		let eventJSON = null;
		try {
			const eventResponse = await fetch(eventURL, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});
			if (eventResponse.status === 200) {
				eventJSON = await eventResponse.json();
				console.log("EVENT JSON:", eventJSON);
			} else {
				console.error(`Failed to fetch event at: ${eventURL}`);
				throw new Error("Failed to fetch event.");
			}
		} catch (error) {
			console.error(error);
			// throw new Error(`Failed to load events: ${error.message}.`);
		}

		// TESTING
		eventJSON = CANNED_EVENT_DATA;

		if (eventJSON) {
			const videoRoot = eventJSON.filter((type) => type.rootVideoNode);
			const videoNodes = videoRoot ? videoRoot[0].rootVideoNode : null;
			const videos =
				videoNodes && videoNodes.nodes
					? videoNodes.nodes.filter((node) => node.node === "VideoSourceNode")
					: [];
			return videos;
		}
		return [];
	}

	async startMixerSubscription(mixerConfiguration) {
		const { isSecure, host, app, eventName, streamName } = mixerConfiguration;
		const protocol = isSecure ? "https" : "http";
		const port = isSecure ? 443 : 5080;
		const eventURL = `${protocol}://${host}:${port}/brewmixer/1.0/${eventName}`;
		try {
			let eventVideos = await this.getEvent(eventURL);
			console.log("EVENT VIDEOS:", eventVideos);

			const subscriberConfig = {
				protocol: isSecure ? "wss" : "ws",
				port: isSecure ? 443 : 5080,
				host,
				app,
				streamName,
				mediaElementId: "mixer-video",
			};
			await this.startMixerPlayback(subscriberConfig);
		} catch (error) {
			console.error(error);
			alert("Failed to load mixer.");
		}

		// TODO: Start subscriber.
		// TODO: Handle event.
	}

	async startMixerPlayback(subscriberConfig) {
		try {
			const { WHEPClient } = red5prosdk;
			const subscriber = new WHEPClient();
			subscriber.on("*", (event) => {
				const { type } = event;
				if (type !== "Subscribe.Time.Update") {
					console.log(`[Mixer:Subscriber] :: ${event.type}`);
				}
			});
			await subscriber.init(subscriberConfig);
			await subscriber.subscribe();
		} catch (error) {
			console.error(error);
			throw new Error(`Failed to load WHEPClient: ${error.message}`);
		}
	}

	selectSource(item, isLive) {
		if (this.delegate) {
			this.delegate.OnSourceSelection(item, isLive);
		}
	}

	selectSourceSection(selection) {
		switch (selection) {
			case SourceSection.SOURCES:
				this.sourceButtons
					.find((button) => button.dataset.selection === SourceSection.SOURCES)
					.classList.add("source-selector_selected");
				this.sourceButtons
					.find((button) => button.dataset.selection === SourceSection.CLIPS)
					.classList.remove("source-selector_selected");
				this.sourceContainers
					.find(
						(container) => container.dataset.source === SourceSection.SOURCES,
					)
					.classList.remove("hidden");
				this.sourceContainers
					.find((container) => container.dataset.source === SourceSection.CLIPS)
					.classList.add("hidden");
				// TODO: Load sources
				break;
			case SourceSection.CLIPS:
				this.sourceButtons
					.find((button) => button.dataset.selection === SourceSection.SOURCES)
					.classList.remove("source-selector_selected");
				this.sourceButtons
					.find((button) => button.dataset.selection === SourceSection.CLIPS)
					.classList.add("source-selector_selected");
				this.sourceContainers
					.find(
						(container) => container.dataset.source === SourceSection.SOURCES,
					)
					.classList.add("hidden");
				this.sourceContainers
					.find((container) => container.dataset.source === SourceSection.CLIPS)
					.classList.remove("hidden");
				// TODO: Load clips
				break;
			default:
				console.error("Invalid selection");
				break;
		}
	}
}

export default SourceContainer;
