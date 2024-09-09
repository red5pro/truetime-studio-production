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

/**
 * NOTE: Requires simple `clips.jsp` file in the webapp directory of the Red5 Pro server.
 */
class ClipsService {
	endpoint = null;
	app = null;
	url = null;
	excludes = [];
	delegate = null;

	index = 0;

	constructor(endpoint, app, excludes = []) {
		this.endpoint = endpoint;
		this.app = app;
		this.excludes = excludes;
		this.url = `${endpoint}/${app}/clips.jsp`;
	}

	getClipUrl(filename) {
		return `${this.endpoint}/${this.app}/${filename}`;
	}

	async getClips() {
		let list = [];
		try {
			const response = await fetch(this.url);
			const json = await response.json();
			json.forEach((entry) => {
				if (entry.endsWith(".mp4")) {
					const filename = entry.substr(0, entry.lastIndexOf(".mp4"));
					const exclusion = this.excludes.find(
						(exclude) => exclude.name === filename,
					);
					if (!exclusion && json.indexOf(`${filename}.flv`) !== -1) {
						const url = this.getClipUrl(entry);
						const streamGuid = `${this.app}/${entry.replace(".mp4", ".flv")}`;
						list.push({
							name: filename,
							filename: entry,
							streamGuid,
							url,
						});
					}
				}
			});
		} catch (error) {
			console.error(error);
		}
		return list;
	}
}

export default ClipsService;
