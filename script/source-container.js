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

const SourceSection = Object.freeze({
	SOURCES: "sources",
	CLIPS: "clips",
});

/**
 * The SourceContainer is responsible for toggling between the Source and Clips displays in the UI.
 */
class SourceContainer {
	sourceButtons = [];
	sourceContainers = [];

	/**
	 * Constructor.
	 * @param {[HTMLElement]} sourceButtons The button elements that affect display of target container.
	 * @param {[HTMLElement]} sourceContainers The target container elements to toggle in the UI.
	 */
	constructor(sourceButtons, sourceContainers) {
		this.sourceButtons = sourceButtons;
		this.sourceContainers = sourceContainers;

		this.sourceButtons.forEach((button) => {
			button.addEventListener("click", (event) => {
				const { target } = event;
				const { dataset } = target;
				this.selectSourceSection(dataset.selection);
			});
		});
	}

	/**
	 * Updates the selected container to display in the UI.
	 * @param {SourceSelection} selection
	 */
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
				break;
			default:
				console.error("Invalid selection");
				break;
		}
	}
}

export default SourceContainer;
