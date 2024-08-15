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

const MAX_CLIPS = 9;
const POLL_INTERVAL = 5000;

class ClipsController {
	service = null;
	listing = null;
	containerElement = null;
	poll = null;
	isStopped = true;
	delegate = null; // { OnSelection }

	constructor(service, containerElement) {
		this.service = service;
		this.containerElement = containerElement;
	}

	start(interval = POLL_INTERVAL) {
		this.isStopped = false;
		if (interval > -1) {
			poll = setInterval(() => {
				if (!this.isStopped) {
					this.getClips();
				}
			}, interval);
		}
		this.getClips();
	}

	stop() {
		this.isStopped = true;
		clearInterval(poll);
	}

	getClips() {
		this.service.getClips().then((clips) => {
			const endIndex = Math.min(MAX_CLIPS, clips.length);
			const clamped = clips.slice(0, endIndex);
			this.fill(clamped, this.containerElement);
		});
	}

	createVideoElementFromClip(clip) {
		const { filename, streamGuid, url } = clip;
		const video = document.createElement("video");
		video.src = url;
		video.type = "video/mp4";
		video.preload = "metadata";
		video.draggable = true;
		video.dataset.name = filename;
		video.dataset.streamGuid = streamGuid;
		video.addEventListener("click", (event) => {
			this.delegate.OnSelection(filename);
		});
		video.addEventListener("dragstart", (event) => {
			event.dataTransfer.setData(
				"text/plain",
				JSON.stringify({ ...clip, type: "clip" }),
			);
		});
		return video;
	}

	fill(clips, containerElement) {
		if (this.listing === null) {
			// clear.
			while (containerElement.firstChild) {
				containerElement.removeChild(containerElement.firstChild);
			}
			// fill.
			clips.forEach((clip) => {
				const video = this.createVideoElementFromClip(clip);
				containerElement.appendChild(video);
			});
		} else if (JSON.stringify(this.listing) != JSON.stringify(clips)) {
			// clear.
			const existing = [];
			while (containerElement.firstChild) {
				const video = containerElement.firstChild;
				const { streamGuid } = video.dataset;
				const found = clips.find((clip) => clip.streamGuid === streamGuid);
				if (found) {
					existing.push(video.cloneNode(true));
				}
				containerElement.removeChild(containerElement.firstChild);
			}
			// fill.
			clips.forEach((clip, clipIndex) => {
				let video = null;
				let index = existing.findIndex(
					(video) => video.dataset.streamGuid === clip.streamGuid,
				);
				if (index > -1) {
					video = existing[index];
					existing.splice(index, 1);
				} else {
					video = this.createVideoElementFromClip(clip);
				}
				containerElement.appendChild(video);
			});
		}
		this.listing = clips;
	}
}

export default ClipsController;
