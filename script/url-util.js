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
 * Utility for parsing query params.
 */

const paramExclude = [];

/**
 * Utility for parsing query params.
 * The following query parameters are supported:
 * - host: The Red5 Pro Server hostname on which the live streams are located.
 * - app: The app context on the Red5 Pro Server on which the live streams are located.
 * - streamName: The name of the stream to broadcast on and subscribe to.
 *
 * Any other query parameters will be parsed as stream names and labels.
 *
 * @returns {object} Object containing the query params.
 */
export const query = () => {
	const searchParams = new URLSearchParams(window.location.search);
	let host = searchParams.get("host")
		? decodeURIComponent(searchParams.get("host"))
		: window.location.hostname;
	let app = searchParams.get("app")
		? decodeURIComponent(searchParams.get("app"))
		: "live";
	let port = searchParams.get("port")
		? decodeURIComponent(searchParams.get("port"))
		: 443;
	let unsecurePort = searchParams.get("unsecure_port")
		? decodeURIComponent(searchParams.get("unsecure_port"))
		: 5080;
	let streamName = searchParams.get("streamName")
		? decodeURIComponent(searchParams.get("streamName"))
		: "stream1";
	let mixerHost = searchParams.get("mixer_host")
		? decodeURIComponent(searchParams.get("mixer_host"))
		: window.location.hostname;
	let mixerEventName = searchParams.get("mixer_event_name")
		? decodeURIComponent(searchParams.get("mixer_event_name"))
		: "event1";
	let mixerStreamName = searchParams.get("mixer_stream_name")
		? decodeURIComponent(searchParams.get("mixer_stream_name"))
		: "mix1";
	return {
		host,
		app,
		port,
		unsecurePort,
		streamName,
		mixerHost,
		mixerEventName,
		mixerStreamName,
		get: (key) => {
			return searchParams.get(key);
		},
	};
};
