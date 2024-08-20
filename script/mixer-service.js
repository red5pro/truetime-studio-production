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
const CANNED_2x2 = [
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

const CANNED_3x3 = [
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
					node: "VideoSourceNode",
					streamGuid: "live/stream1",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 0,
					destY: 0,
					destWidth: 640,
					destHeight: 360,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream2",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 640,
					destY: 0,
					destWidth: 640,
					destHeight: 360,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream3",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 1280,
					destY: 0,
					destWidth: 640,
					destHeight: 360,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream4",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 0,
					destY: 360,
					destWidth: 640,
					destHeight: 360,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream5",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 640,
					destY: 360,
					destWidth: 640,
					destHeight: 360,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream6",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 1280,
					destY: 360,
					destWidth: 640,
					destHeight: 360,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream7",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 0,
					destY: 720,
					destWidth: 640,
					destHeight: 360,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream8",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 640,
					destY: 720,
					destWidth: 640,
					destHeight: 360,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream9",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 1280,
					destY: 720,
					destWidth: 640,
					destHeight: 360,
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
				{
					streamGuid: "live/stream5",
					pan: 0,
					gain: -100,
					node: "AudioSourceNode",
				},
				{
					streamGuid: "live/stream6",
					pan: 0,
					gain: -100,
					node: "AudioSourceNode",
				},
				{
					streamGuid: "live/stream7",
					pan: 0,
					gain: -100,
					node: "AudioSourceNode",
				},
				{
					streamGuid: "live/stream8",
					pan: 0,
					gain: -100,
					node: "AudioSourceNode",
				},
				{
					streamGuid: "live/stream9",
					pan: 0,
					gain: -100,
					node: "AudioSourceNode",
				},
			],
			node: "SumNode",
		},
	},
];

const CANNED_4x4 = [
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
					node: "VideoSourceNode",
					streamGuid: "live/stream1",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 0,
					destY: 0,
					destWidth: 480,
					destHeight: 270,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream2",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 480,
					destY: 0,
					destWidth: 480,
					destHeight: 270,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream3",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 960,
					destY: 0,
					destWidth: 480,
					destHeight: 270,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream4",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 1440,
					destY: 0,
					destWidth: 480,
					destHeight: 270,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream5",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 0,
					destY: 270,
					destWidth: 480,
					destHeight: 270,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream6",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 480,
					destY: 270,
					destWidth: 480,
					destHeight: 270,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream7",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 960,
					destY: 270,
					destWidth: 480,
					destHeight: 270,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream8",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 1440,
					destY: 270,
					destWidth: 480,
					destHeight: 270,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream9",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 0,
					destY: 540,
					destWidth: 480,
					destHeight: 270,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream10",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 480,
					destY: 540,
					destWidth: 480,
					destHeight: 270,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream11",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 960,
					destY: 540,
					destWidth: 480,
					destHeight: 270,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream12",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 1440,
					destY: 540,
					destWidth: 480,
					destHeight: 270,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream13",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 0,
					destY: 810,
					destWidth: 480,
					destHeight: 270,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream14",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 480,
					destY: 810,
					destWidth: 480,
					destHeight: 270,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream15",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 960,
					destY: 810,
					destWidth: 480,
					destHeight: 270,
				},
				{
					node: "VideoSourceNode",
					streamGuid: "live/stream16",
					sourceX: 0,
					sourceY: 0,
					sourceWidth: 1920,
					sourceHeight: 1080,
					destX: 1440,
					destY: 810,
					destWidth: 480,
					destHeight: 270,
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
				{
					streamGuid: "live/stream5",
					pan: 0,
					gain: -100,
					node: "AudioSourceNode",
				},
				{
					streamGuid: "live/stream6",
					pan: 0,
					gain: -100,
					node: "AudioSourceNode",
				},
				{
					streamGuid: "live/stream7",
					pan: 0,
					gain: -100,
					node: "AudioSourceNode",
				},
				{
					streamGuid: "live/stream8",
					pan: 0,
					gain: -100,
					node: "AudioSourceNode",
				},
				{
					streamGuid: "live/stream9",
					pan: 0,
					gain: -100,
					node: "AudioSourceNode",
				},
				{
					streamGuid: "live/stream10",
					pan: 0,
					gain: -100,
					node: "AudioSourceNode",
				},
				{
					streamGuid: "live/stream11",
					pan: 0,
					gain: -100,
					node: "AudioSourceNode",
				},
				{
					streamGuid: "live/stream12",
					pan: 0,
					gain: -100,
					node: "AudioSourceNode",
				},
				{
					streamGuid: "live/stream13",
					pan: 0,
					gain: -100,
					node: "AudioSourceNode",
				},
				{
					streamGuid: "live/stream14",
					pan: 0,
					gain: -100,
					node: "AudioSourceNode",
				},
				{
					streamGuid: "live/stream15",
					pan: 0,
					gain: -100,
					node: "AudioSourceNode",
				},
				{
					streamGuid: "live/stream16",
					pan: 0,
					gain: -100,
					node: "AudioSourceNode",
				},
			],
			node: "SumNode",
		},
	},
];

class MixerService {
	endpoint = null;

	constructor(endpoint) {
		this.endpoint = endpoint;
	}

	responseDataToVideoListing(responseData) {
		const videoRoot = responseData.filter((type) => type.rootVideoNode);
		const videoNodes = videoRoot ? videoRoot[0].rootVideoNode : null;
		const videos =
			videoNodes && videoNodes.nodes
				? videoNodes.nodes.filter((node) => node.node === "VideoSourceNode")
				: [];
		return videos;
	}

	async updateGrid(columns) {
		let eventJSON = null;
		try {
			let grid = CANNED_2x2;
			switch ("" + columns) {
				case "3":
					grid = CANNED_3x3;
					break;
				case "4":
					grid = CANNED_4x4;
					break;
				default:
					grid = CANNED_2x2;
					break;
			}
			const eventResponse = await fetch(this.endpoint, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ rootNodes: grid }),
			});
			if (eventResponse.status === 200) {
				eventJSON = grid;
			} else {
				console.error(`Failed to update grid: ${eventURL}`);
				throw new Error("Failed update grid.");
			}
		} catch (error) {
			console.error(error);
			alert("Failed to update grid.");
			// throw error;
		}
		if (eventJSON) {
			return this.responseDataToVideoListing(eventJSON);
		}
		return [];
	}

	async getEvent() {
		let eventJSON = null;
		try {
			const eventResponse = await fetch(this.endpoint, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});
			if (eventResponse.status === 200) {
				eventJSON = await eventResponse.json();
			} else {
				console.error(`Failed to fetch event at: ${eventURL}`);
				throw new Error("Failed to fetch event.");
			}
		} catch (error) {
			console.error(error);
			// throw new Error(`Failed to load events: ${error.message}.`);
		}

		// TODO: TESTING;
		// if (!eventJSON) {
		// 	eventJSON = CANNED_4x4;
		// }

		if (eventJSON) {
			return this.responseDataToVideoListing(eventJSON);
		}
		return [];
	}
}

export default MixerService;
