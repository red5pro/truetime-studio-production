/*global red5prosdk*/
const { setLogLevel, WHEPClient } = red5prosdk;

setLogLevel("debug");

const NAME = "[Red5:IBC]";

const SourceSection = Object.freeze({
	SOURCES: "sources",
	CLIPS: "clips",
});

const sourceButtons = Array.from(
	document.querySelectorAll(".source-selector_item"),
);
sourceButtons.forEach((button) => {
	button.addEventListener("click", (event) => {
		const { target } = event;
		const { dataset } = target;
		selectSourceSection(dataset.selection);
	});
});

const selectSourceSection = (selection) => {
	switch (selection) {
		case SourceSection.SOURCES:
			console.log("SOURCES");
			break;
		case SourceSection.CLIPS:
			console.log("CLIPS");
			break;
		default:
			console.error("Invalid selection");
			break;
	}
};
